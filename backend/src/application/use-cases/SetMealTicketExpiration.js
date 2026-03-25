class SetMealTicketExpiration {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, expirationDate) {
    const registration = await this.registrationRepository.getById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    return await this.registrationRepository.updateMealTicketExpiration(id, expirationDate);
  }
}

module.exports = SetMealTicketExpiration;
