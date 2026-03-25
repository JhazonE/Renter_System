class SuspendMealTicket {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, suspendStart, suspendEnd) {
    const registration = await this.registrationRepository.getById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // null means removing suspension
    return await this.registrationRepository.updateMealTicketSuspension(id, suspendStart, suspendEnd);
  }
}

module.exports = SuspendMealTicket;
