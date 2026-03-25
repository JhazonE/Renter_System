class GetAuditLogs {
  constructor(auditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute(filters) {
    return await this.auditLogRepository.getAll(filters);
  }
}

module.exports = GetAuditLogs;
