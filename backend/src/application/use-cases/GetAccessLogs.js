class GetAccessLogs {
  constructor(accessLogRepository) {
    this.accessLogRepository = accessLogRepository;
  }

  async execute() {
    return await this.accessLogRepository.getAll();
  }
}

module.exports = GetAccessLogs;
