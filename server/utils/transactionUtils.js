const axios = require('axios');

const fetchUserTransactions = async (userId) => {
    const response = await axios.get(`http://localhost:5000/api/transactions/transaction/${userId}/transactions`);
    return response.data;
};

module.exports = { fetchUserTransactions };
