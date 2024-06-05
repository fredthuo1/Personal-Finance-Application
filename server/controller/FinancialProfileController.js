const FinancialProfile = require('../models/FinancialProfile');

const calculateTotalAssets = (assets) => {
    return (assets.cashAndSavings || 0) +
        (assets.investments || 0) +
        (Array.from(assets.retirementAccounts.values()).reduce((sum, value) => sum + value, 0) || 0) +
        (assets.realEstate || 0) +
        (assets.personalProperty || 0) +
        (assets.otherAssets || 0);
};

const calculateTotalLiabilities = (liabilities) => {
    return (liabilities.loans.reduce((sum, loan) => sum + loan.balance, 0) || 0) +
        (liabilities.creditCardDebt || 0) +
        (liabilities.otherLiabilities || 0);
};

const getFinancialProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const financialProfile = await FinancialProfile.findOne({ userId }).populate('userId');
        if (!financialProfile) {
            return res.status(404).json({ error: 'Financial profile not found' });
        }
        res.status(200).json(financialProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const createFinancialProfile = async (req, res) => {
    try {
        const { userId, assets, liabilities } = req.body;

        const totalAssets = calculateTotalAssets(assets);
        const totalLiabilities = calculateTotalLiabilities(liabilities);

        const financialProfile = new FinancialProfile({
            userId,
            assets: { ...assets, totalAssets },
            liabilities: { ...liabilities, totalLiabilities }
        });

        await financialProfile.save();
        res.status(201).json(financialProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateFinancialProfile = async (req, res) => {
    try {
        const financialProfileId = req.params.id;
        const updatedData = req.body;

        const totalAssets = calculateTotalAssets(updatedData.assets);
        const totalLiabilities = calculateTotalLiabilities(updatedData.liabilities);

        const updatedProfile = await FinancialProfile.findByIdAndUpdate(
            financialProfileId,
            {
                ...updatedData,
                assets: { ...updatedData.assets, totalAssets },
                liabilities: { ...updatedData.liabilities, totalLiabilities }
            },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ error: 'Financial profile not found' });
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteFinancialProfile = async (req, res) => {
    try {
        const financialProfileId = req.params.id;
        const deletedProfile = await FinancialProfile.findByIdAndDelete(financialProfileId);
        if (!deletedProfile) {
            return res.status(404).json({ error: 'Financial profile not found' });
        }
        res.status(200).json({ message: 'Financial profile deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getFinancialProfile, createFinancialProfile, updateFinancialProfile, deleteFinancialProfile };