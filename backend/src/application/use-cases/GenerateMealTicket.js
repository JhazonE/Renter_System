const axios = require('axios');
const MealTicket = require('../../domain/entities/MealTicket');
const { loadWindows, getNearestMealPeriod, toLocalNaive } = require('../../shared/mealPeriods');

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
        // Use the NEAREST period, never null. The strict getMealPeriod() returns
        // null in the gaps between windows (e.g. 10:00-11:00 AM), which used to
        // bypass the limit entirely and let a student re-claim. getNearestMealPeriod
        // attributes every scan -- in-window or off-hours -- to one of the three
        // meal services so the limit always applies.
        mealPeriod = getNearestMealPeriod(now, windows);

        // Count this student's tickets across the WHOLE local day, then bucket
        // each one by its own nearest period. A whole-day scan is required (not
        // just the period's window bounds) because a gap-generated ticket lands
        // outside any window and would otherwise escape the per-period count.
        // Local wall-clock bounds: generated_at is TIMESTAMP WITHOUT TIME ZONE and
        // Postgres treats an ISO "Z" bound as naive. See toLocalNaive() for details.
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const todaysTickets = await this.mealTicketRepository.getByRegistrationInRange(
          registrationId,
          toLocalNaive(dayStart),
          toLocalNaive(dayEnd)
        );
        const alreadyForPeriod = (todaysTickets || []).some(t => {
          const genAt = new Date(t.generatedAt);
          return !isNaN(genAt.getTime()) && getNearestMealPeriod(genAt, windows) === mealPeriod;
        });
        if (alreadyForPeriod) {
          log(`[GenerateMealTicket] RID ${registrationId} already claimed ${mealPeriod} today`);
          throw new Error(`${mealPeriod} meal already claimed today. Only one ${mealPeriod} ticket is allowed per student.`);
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
