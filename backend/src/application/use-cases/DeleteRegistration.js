class DeleteRegistration {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id) {
    return await this.registrationRepository.delete(id);
  }
}

module.exports = DeleteRegistration;
