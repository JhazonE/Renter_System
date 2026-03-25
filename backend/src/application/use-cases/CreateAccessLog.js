class CreateAccessLog {
  constructor(accessLogRepository) {
    this.accessLogRepository = accessLogRepository;
  }

  async execute(logData) {
    // Generate current date and time if not provided
    const now = new Date();
    const date = logData.date || now.toISOString().split('T')[0];
    const time = logData.time || `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
    
    const newLog = {
      ...logData,
      date,
      time
    };
    
    return await this.accessLogRepository.create(newLog);
  }
}

module.exports = CreateAccessLog;
