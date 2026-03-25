class AuditLogController {
  constructor(getAuditLogs, createAuditLog) {
    this.getAuditLogs = getAuditLogs;
    this.createAuditLog = createAuditLog;
  }

  async getAll(req, res) {
    try {
      const filters = {
        admin: req.query.admin,
        type: req.query.type,
        status: req.query.status,
        limit: req.query.limit,
        offset: req.query.offset
      };
      const logs = await this.getAuditLogs.execute(filters);
      
      // Transform snake_case from DB to camelCase for frontend
      const formattedLogs = logs.map(log => ({
        id: log.id.toString(),
        admin: log.admin,
        adminId: log.admin_id,
        type: log.type,
        details: log.details,
        subDetails: log.sub_details,
        status: log.status,
        date: log.date, // might be a Date object, can be formatted if needed
        time: log.time,
        initials: log.initials,
        createdAt: log.created_at
      }));

      res.status(200).json(formattedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req, res) {
    try {
      const logData = req.body;
      const newLog = await this.createAuditLog.execute({
        admin: logData.admin,
        admin_id: logData.adminId, // Accept camelCase from client, save as snake_case to DB
        type: logData.type,
        details: logData.details,
        sub_details: logData.subDetails,
        status: logData.status,
        date: logData.date,
        time: logData.time,
        initials: logData.initials
      });
      res.status(201).json(newLog);
    } catch (error) {
      console.error('Error creating audit log:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuditLogController;
