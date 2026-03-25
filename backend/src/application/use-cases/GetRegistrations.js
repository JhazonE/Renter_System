class GetRegistrations {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute() {
    return await this.registrationRepository.getAll();
  }
}

module.exports = GetRegistrations;
