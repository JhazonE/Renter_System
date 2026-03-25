const MealTicket = require('../../domain/entities/MealTicket');

class GenerateMealTicket {
  constructor(mealTicketRepository, registrationRepository) {
    this.mealTicketRepository = mealTicketRepository;
    this.registrationRepository = registrationRepository;
  }

  async execute(registrationId) {
    // 1. Verify consumer/renter exists
    const registration = await this.registrationRepository.getById(registrationId);
    if (!registration) {
      throw new Error(`Registration with ID ${registrationId} not found`);
    }

    // 2. Check if allowed to generate
    if (!registration.canGenerateMealTicket) {
      throw new Error('Meal ticket generation not authorized for this renter');
    }

    // 3. Generate a unique ticket number
    // Format: MT-YYYYMMDD-XXXX where XXXX is a random string or partial registration ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketNumber = `MT-${dateStr}-${randomStr}`;

    // 3. Set expiration (extending 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const mealTicket = new MealTicket({
      registrationId,
      ticketNumber,
      status: 'Active',
      expiresAt: expiresAt.toISOString()
    });

    const savedTicket = await this.mealTicketRepository.save(mealTicket);
    
    // 5. Consume the allowance
    await this.registrationRepository.updateMealTicketAllowance(registrationId, false);

    return savedTicket;
  }
}

module.exports = GenerateMealTicket;
