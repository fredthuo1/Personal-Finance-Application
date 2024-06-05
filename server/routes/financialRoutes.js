const express = require('express');
const router = express.Router();
const { getWeeklyAdvice, getMonthlyAdvice, getYearlyAdvice } = require('../controller/financialController');

router.post('/weekly-advice', getWeeklyAdvice);
router.post('/monthly-advice', getMonthlyAdvice);
router.post('/yearly-advice', getYearlyAdvice);

module.exports = router;
