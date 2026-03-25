class ToggleMealTicketAllowance {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, allowed) {
    return await this.registrationRepository.updateMealTicketAllowance(id, allowed);
  }
}

module.exports = ToggleMealTicketAllowance;
