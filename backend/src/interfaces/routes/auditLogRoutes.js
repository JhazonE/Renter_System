const express = require('express');

module.exports = (auditLogController) => {
  const router = express.Router();

  router.get('/', (req, res) => auditLogController.getAll(req, res));
  router.post('/', (req, res) => auditLogController.create(req, res));

  return router;
};
