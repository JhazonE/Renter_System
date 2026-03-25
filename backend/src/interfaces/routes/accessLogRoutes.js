const express = require('express');
const { requirePermission } = require('../../infrastructure/security/permissions');

const createAccessLogRoutes = (controller) => {
  const router = express.Router();

  // Route to get all access logs
  router.get('/', (req, res) => controller.getAll(req, res));

  // Route to create an access log
  router.post('/', (req, res) => controller.create(req, res));

  return router;
};

module.exports = createAccessLogRoutes;
