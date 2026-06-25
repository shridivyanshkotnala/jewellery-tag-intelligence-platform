const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');

router.use(authenticateJWT);

router.get('/formula', settingsController.getFormulaConfig);
router.post('/formula', requirePermission('manageRates'), settingsController.updateFormulaConfig);

module.exports = router;
