const Registration = require('../../domain/entities/Registration');

class CreateRegistration {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(registrationData) {
    const registration = new Registration({
      ...registrationData,
      status: registrationData.status || 'Pending',
      date: new Date().toISOString().split('T')[0] // current date
    });
    
    return await this.registrationRepository.save(registration);
  }
}

module.exports = CreateRegistration;
