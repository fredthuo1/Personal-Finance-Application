import React, { useState, useEffect } from "react";
import { useAuth } from '../components/AuthContext';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const { userId } = useAuth();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/transactions/transaction/${userId}/transactions`);
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        if (userId) {
            fetchTransactions();
        }
    }, [userId]);

    const renderTransactionsByCategory = () => {
        const categorizedTransactions = {};

        if (!Array.isArray(transactions)) {
            return <p>No transactions found.</p>;
        }

        transactions.forEach(transaction => {
            const category = transaction.Category || 'Other';
            if (!categorizedTransactions[category]) {
                categorizedTransactions[category] = [];
            }
            categorizedTransactions[category].push(transaction);
        });

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
            {renderTransactionsByCategory()}
        </div>
    );
}

export default Transactions;
