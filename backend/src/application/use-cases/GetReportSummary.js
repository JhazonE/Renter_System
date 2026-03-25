class GetReportSummary {
  constructor(registrationRepository, accessLogRepository) {
    this.registrationRepository = registrationRepository;
    this.accessLogRepository = accessLogRepository;
  }

  async execute() {
    const registrations = await this.registrationRepository.getAll();
    const accessLogs = await this.accessLogRepository.getAll();

    const activeRentersList = registrations.filter(r => r.canGenerateMealTicket);
    const biometricUsersList = registrations.filter(r => r.hasFingerprint || r.has_fingerprint);
    
    const totalRenters = registrations.length;
    const activeRenters = activeRentersList.length;
    const blockedRenters = totalRenters - activeRenters;

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = accessLogs.filter(log => log.date === today);
    const successfulAccessToday = todayLogs.filter(log => log.status === 'Success').length;
    const deniedAccessToday = todayLogs.filter(log => log.status === 'Denied' || log.status === 'Failed').length;

    return {
      summary: {
        totalRenters,
        activeRenters,
        blockedRenters,
        successfulAccessToday,
        deniedAccessToday,
        lastUpdated: new Date().toISOString()
      },
      recentActivity: accessLogs.slice(0, 10),
      activeRentersList,
      biometricUsersList
    };
  }
}

module.exports = GetReportSummary;
