import React, { useState, useEffect } from "react";

function MonthlyTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/transactions/getAllTransactions`);
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, []);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const renderTransactionsByCategory = () => {
        // Filter transactions based on the selected month
        const filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.Date);
            const month = date.getMonth() + 1; // Month is zero-based, so we add 1
            return month === parseInt(selectedMonth);
        });

        // Create a map of category to transactions
        const categorizedTransactions = {};
        filteredTransactions.forEach(transaction => {
            const category = transaction.Category || 'Other';
            if (!categorizedTransactions[category]) {
                categorizedTransactions[category] = [];
            }
            categorizedTransactions[category].push(transaction);
        });

        // Render transactions grouped by category
        return Object.entries(categorizedTransactions).map(([category, transactions]) => (
            <div key={category} className="category">
                <h2>{category}</h2>
                <ul className="transaction-list">
                    {transactions.map((transaction, index) => (
                        <li key={index} className="transaction">
                            <span className="date">{transaction.Date}</span>
                            <span className="description">{transaction.Description}</span>
                            <span className="amount">${transaction.Amount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ));
    };

    return (
        <div className="transactions-container">
            <h1>All Transactions by Category</h1>
            <select onChange={handleMonthChange} value={selectedMonth}>
                <option value="">Select Month</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
            {renderTransactionsByCategory()}
        </div>
    );
}

export default MonthlyTransactions;
