const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rate.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
// Optional: If you want to restrict this to only owners or specific employee permissions, 
// you can import requirePermission from rbac.middleware.js
const { requirePermission } = require('../middleware/rbac.middleware');

router.use(authenticateJWT);
// Assuming 'businessDetails' or a new permission 'manageRates' is needed. 
// For now, we'll allow owners, and you can map employee permissions later.
// router.use(requirePermission('businessDetails')); 

// Gold
router.get('/gold', rateController.getGoldRates);
router.post('/gold', rateController.updateGoldRate);

// Diamond
router.get('/diamond', rateController.getDiamondRates);
router.post('/diamond', rateController.addOrUpdateDiamondRate);
router.delete('/diamond/:id', rateController.deleteDiamondRate);

// Colorstone
router.get('/colorstone', rateController.getColorstoneRates);
router.post('/colorstone', rateController.addOrUpdateColorstoneRate);
router.delete('/colorstone/:id', rateController.deleteColorstoneRate);

module.exports = router;
