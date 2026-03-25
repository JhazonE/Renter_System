class GetExpiredMealTickets {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute() {
    return await this.registrationRepository.getExpiredMealTickets();
  }
}

module.exports = GetExpiredMealTickets;
