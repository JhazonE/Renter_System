class GetMealTicketsByRegistration {
  constructor(mealTicketRepository) {
    this.mealTicketRepository = mealTicketRepository;
  }

  async execute(registrationId) {
    return await this.mealTicketRepository.getByRegistrationId(registrationId);
  }
}

module.exports = GetMealTicketsByRegistration;
