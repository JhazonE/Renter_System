class AccessLogController {
  constructor(getAccessLogs, createAccessLog) {
    this.getAccessLogs = getAccessLogs;
    this.createAccessLog = createAccessLog;
  }

  async getAll(req, res) {
    try {
      const logs = await this.getAccessLogs.execute();
      res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const logData = req.body;
      const parsedData = {
        name: logData.name || 'Unknown User',
        dept: logData.dept || 'Unknown Dept.',
        point: logData.point || 'Unknown Point',
        location: logData.location || 'Unknown Location',
        type: logData.type || 'Unknown Type',
        status: logData.status || 'Granted',
        avatar: logData.avatar || null
      };

      const newLog = await this.createAccessLog.execute(parsedData);
      res.status(201).json(newLog);
    } catch (error) {
      console.error('Error creating access log:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AccessLogController;
