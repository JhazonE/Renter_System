class SetMealTicketExpiration {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, expirationDate) {
    const registration = await this.registrationRepository.getById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    await this.registrationRepository.updateMealTicketAllowance(id, true);
    return await this.registrationRepository.updateMealTicketExpiration(id, expirationDate);
  }
}

module.exports = SetMealTicketExpiration;
