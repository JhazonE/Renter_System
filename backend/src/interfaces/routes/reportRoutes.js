const express = require('express');

function createReportRoutes(reportController) {
  const router = express.Router();

  router.get('/summary', (req, res) => reportController.getSummary(req, res));

  return router;
}

module.exports = createReportRoutes;
