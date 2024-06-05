const express = require('express');
const router = express.Router();
const financialProfileController = require('../controller/FinancialProfileController');
const { getComparisonData } = require('../utils/getComparisonData');

router.get('/:userId', financialProfileController.getFinancialProfile);

router.post('/', financialProfileController.createFinancialProfile);

router.put('/:id', financialProfileController.updateFinancialProfile);

router.delete('/:id', financialProfileController.deleteFinancialProfile);

router.get('/:userId/comparison', async (req, res) => {
    try {
        const userId = req.params.userId;
        const comparisonData = await getComparisonData(userId);
        res.status(200).json(comparisonData);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ error: error.message }); 
    }
});

module.exports = router; 
