const axios = require('axios');
const MealTicket = require('../../domain/entities/MealTicket');
const { loadWindows, getPeriodForLimit, phDateString, toLocalNaive } = require('../../shared/mealPeriods');

class GenerateMealTicket {
  constructor(mealTicketRepository, registrationRepository, systemSettingsRepository) {
    this.mealTicketRepository = mealTicketRepository;
    this.registrationRepository = registrationRepository;
    this.systemSettingsRepository = systemSettingsRepository;
  }

  async execute(registrationId, mealType, biometricTemplate) {
    let registration;
    const log = (msg) => {
      console.log(msg);
    };

    // 1. Identification logic
    if ((!registrationId || registrationId === '1' || registrationId === 1) && biometricTemplate) {
      log('[GenerateMealTicket] Attempting identification...');
      
      const allRegistrations = await this.registrationRepository.getAll();
      const candidates = allRegistrations.filter(r => r.hasFingerprint && r.biometricTemplate && r.biometricTemplate.length > 50);
      
      if (candidates.length === 0) {
        log('[GenerateMealTicket] No candidates found.');
        throw new Error('No enrolled fingerprints found in the system');
      }

      log(`[GenerateMealTicket] Sending ${candidates.length} candidates to Bridge.`);

      try {
        // const axios = require('axios'); // Moved to top
        const bridgeUrl = process.env.BIOMETRIC_BRIDGE_URL || 'http://127.0.0.1:5003';
        log(`[GenerateMealTicket] Calling Bridge at: ${bridgeUrl}/identify`);
        const identifyResponse = await axios.post(`${bridgeUrl}/identify`, {
          probe: biometricTemplate,
          candidates: candidates.map(c => c.biometricTemplate)
        });

        const { matchedIndex, status } = identifyResponse.data;
        log(`[GenerateMealTicket] Bridge Response: status=${status}, matchedIndex=${matchedIndex}`);

        if (status === 'SUCCESS' && matchedIndex !== undefined && matchedIndex !== -1) {
          registration = candidates[matchedIndex];
          registrationId = registration.id;
          log(`[GenerateMealTicket] IDENTIFIED_SUCCESS: ${registration.firstName} ${registration.lastName} (ID: ${registrationId})`);
        } else {
          log('[GenerateMealTicket] Identification failed: Fingerprint not recognized');
          throw new Error('Biometric identification failed: Fingerprint not recognized');
        }
      } catch (err) {
        const bridgeErr = err.response ? `Bridge Error ${err.response.status}: ${JSON.stringify(err.response.data)}` : err.message;
        log(`[GenerateMealTicket] Identification error: ${bridgeErr}`);
        throw new Error(bridgeErr || 'Biometric identification service error');
      }
    } else {
      log(`[GenerateMealTicket] Standard lookup for ID: ${registrationId}`);
      // Standard lookup by ID
      registration = await this.registrationRepository.getById(registrationId);
      if (!registration) {
        log(`[GenerateMealTicket] Registration not found for ID: ${registrationId}`);
        throw new Error(`Registration with ID ${registrationId} not found`);
      }

      // Verification (1:1) if template is provided
      if (registration.hasFingerprint && registration.biometricTemplate && biometricTemplate) {
        // We can still use /identify for 1:1 by passing a single candidate
        try {
          // const axios = require('axios'); // Moved to top
          const bridgeUrl = process.env.BIOMETRIC_BRIDGE_URL || 'http://127.0.0.1:5003';
          log(`[GenerateMealTicket] Calling Bridge (1:1) at: ${bridgeUrl}/identify`);
          const verifyResponse = await axios.post(`${bridgeUrl}/identify`, {
            probe: biometricTemplate,
            candidates: [registration.biometricTemplate]
          });
          if (verifyResponse.data.matchedIndex === -1) {
            throw new Error('Biometric verification failed: Fingerprint does not match the registered user');
          }
        } catch (err) {
          console.error('[GenerateMealTicket] Verification error:', err.message);
          throw new Error(err.message || 'Biometric verification service error');
        }
      }
    }

    log(`[GenerateMealTicket] Checking authorization for RID ${registrationId}. canGenerateMealTicket: ${registration.canGenerateMealTicket}`);
    // 2. Check if allowed to generate (Disabled status)
    if (!registration.canGenerateMealTicket) {
      log(`[GenerateMealTicket] RID ${registrationId} is not authorized for meal tickets (canGenerateMealTicket: false)`);
      throw new Error('Please Contact the Registrar Office for the Validations');
    }

    // 2.1 Check for expiration
    if (registration.mealTicketExpirationDate) {
      const expirationDate = new Date(registration.mealTicketExpirationDate);
      const now = new Date();
      if (expirationDate < now) {
        log(`[GenerateMealTicket] RID ${registrationId} has an expired meal ticket plan (${registration.mealTicketExpirationDate})`);
        throw new Error('Please Contact the Registrar Office for the Validations');
      }
    }

    // 2.2 Enforce 1 meal per period (Breakfast / Lunch / Dinner) when enabled.
    let mealPeriod = null;
    if (this.systemSettingsRepository) {
      const restrictionEnabled = await this.systemSettingsRepository.get('meal_restriction_enabled');
      if (restrictionEnabled === 'true') {
        const windows = await loadWindows(this.systemSettingsRepository);
        const now = new Date();

        // Which meal slot this scan consumes. getPeriodForLimit charges an
        // off-hours scan to the window that just CLOSED, so re-scanning after
        // service ends can't double-claim that meal. Crucially it never looks
        // forward: a scan before the day's first window opens (e.g. 1 AM)
        // consumes nothing, instead of burning the breakfast the student has
        // not had yet. getNearestMealPeriod does look forward and is why
        // students were told a set was "already claimed" when it wasn't.
        mealPeriod = getPeriodForLimit(now, windows);

        // null = no meal service has happened yet today, so there is no slot to
        // consume and nothing to check.
        if (mealPeriod) {
          // Bucket by the PHILIPPINE day, not the server-local day. generated_at is
          // TIMESTAMP WITHOUT TIME ZONE holding the DB's wall clock (UTC on Railway),
          // 8 hours behind PH. A server-local day window both merges two PH days
          // (false "already claimed" denials) and splits one PH day in two (letting
          // the same meal be claimed twice). So over-fetch a +/-1 day range and filter
          // precisely by PH calendar date in JS -- the approach GetReportSummary uses.
          const today = phDateString(now);
          const queryStart = new Date(now);
          queryStart.setDate(queryStart.getDate() - 1);
          queryStart.setHours(0, 0, 0, 0);
          const queryEnd = new Date(now);
          queryEnd.setDate(queryEnd.getDate() + 2);
          queryEnd.setHours(0, 0, 0, 0);

          const candidateTickets = await this.mealTicketRepository.getByRegistrationInRange(
            registrationId,
            toLocalNaive(queryStart),
            toLocalNaive(queryEnd)
          );

          const alreadyForPeriod = (candidateTickets || []).some(t => {
            const genAt = new Date(t.generatedAt);
            if (isNaN(genAt.getTime())) return false;
            if (phDateString(genAt) !== today) return false;
            return getPeriodForLimit(genAt, windows) === mealPeriod;
          });

          if (alreadyForPeriod) {
            log(`[GenerateMealTicket] RID ${registrationId} already claimed ${mealPeriod} today`);
            throw new Error(`${mealPeriod} meal already claimed today. Only one ${mealPeriod} ticket is allowed per student.`);
          }
        }
      }
    }

    log(`[GenerateMealTicket] Generating ticket number for RID ${registrationId}...`);

    // 3. Generate a unique ticket number
    // Format: MT-YYYYMMDD-XXXX where XXXX is a random string or partial registration ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketNumber = `MT-${dateStr}-${randomStr}`;

    // 3. Set expiration (extending 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 4. Use renter's specific meal type from DB (source of truth for biometric identification)
    // Preference: 1. DB record, 2. Provided arg (if any), 3. Catch-all default
    const finalMealType = registration.mealType || mealType || 'Non-Veggie';

    const mealTicket = new MealTicket({
      registrationId,
      ticketNumber,
      mealType: finalMealType,
      renterName: `${registration.firstName || ''} ${registration.lastName || ''}`.trim() || registration.name || 'Unknown',
      status: 'Active',
      expiresAt: expiresAt.toISOString()
    });

    log(`[GenerateMealTicket] Saving ticket ${ticketNumber} for RID ${registrationId}...`);
    const savedTicket = await this.mealTicketRepository.save(mealTicket);
    log(`[GenerateMealTicket] Ticket ${ticketNumber} saved successfully.`);

    // Printing is now handled by the frontend terminal to allow for terminal-specific printer selection.
    // Attach renter context the printout needs (floor + the plan expiration set for this renter).
    savedTicket.floorNo = registration.floorNo || null;
    savedTicket.roomNo = registration.roomNo || null;
    savedTicket.mealTicketExpirationDate = registration.mealTicketExpirationDate || null;
    savedTicket.mealPeriod = mealPeriod;

    return savedTicket;
  }
}

module.exports = GenerateMealTicket;
