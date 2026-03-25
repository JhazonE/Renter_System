const express = require('express');
const authorize = require('../../infrastructure/middleware/authorize');
const { PERMISSIONS } = require('../../infrastructure/security/permissions');

function createUserRoutes(userController) {
  const router = express.Router();

  router.post('/login', (req, res) => userController.login(req, res));

  router.get('/', authorize(PERMISSIONS.VIEW_LOGS), (req, res) => userController.getAll(req, res));
  router.post('/', authorize(PERMISSIONS.MANAGE_USERS), (req, res) => userController.create(req, res));
  router.put('/:id', authorize(PERMISSIONS.MANAGE_USERS), (req, res) => userController.update(req, res));
  router.delete('/:id', authorize(PERMISSIONS.MANAGE_USERS), (req, res) => userController.delete(req, res));

  return router;
}

module.exports = createUserRoutes;
