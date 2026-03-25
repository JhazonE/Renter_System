class ReportController {
  constructor(getReportSummary) {
    this.getReportSummary = getReportSummary;
  }

  async getSummary(req, res) {
    try {
      const summary = await this.getReportSummary.execute();
      res.json(summary);
    } catch (error) {
      console.error('Error in ReportController.getSummary:', error);
      res.status(500).json({ error: 'Failed to fetch report summary' });
    }
  }
}

module.exports = ReportController;
