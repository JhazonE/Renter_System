class UpdateRegistrationStatus {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, status) {
    // Basic validation could also be done here or in the entity
    return await this.registrationRepository.updateStatus(id, status);
  }
}

module.exports = UpdateRegistrationStatus;
