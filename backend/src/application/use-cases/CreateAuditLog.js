class CreateAuditLog {
  constructor(auditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute(logData) {
    return await this.auditLogRepository.create(logData);
  }
}

module.exports = CreateAuditLog;
