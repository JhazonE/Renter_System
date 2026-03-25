const Registration = require('../../domain/entities/Registration');

class UpdateRegistration {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, registrationData) {
    const registration = new Registration({ ...registrationData, id });
    return await this.registrationRepository.update(id, registration);
  }
}

module.exports = UpdateRegistration;
