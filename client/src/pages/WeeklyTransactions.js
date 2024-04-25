import React, { useState, useEffect } from "react";

function WeeklyTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState("");
    const [weekOptions, setWeekOptions] = useState([]);

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

    useEffect(() => {
        if (transactions.length > 0) {
            const weeks = getUniqueWeeks(transactions);
            setWeekOptions(weeks);
            setSelectedWeek(weeks[0]); // Set the default selected week
        }
    }, [transactions]);

    const getUniqueWeeks = (transactions) => {
        const weeksSet = new Set();
        transactions.forEach(transaction => {
            const date = new Date(transaction.Date);
            const week = getWeekNumber(date);
            weeksSet.add(week);
        });
        return Array.from(weeksSet).sort((a, b) => a - b);
    };

    const getWeekNumber = (date) => {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
        return week;
    };

    const renderTransactionsByCategory = () => {
        // Filter transactions based on the selected week
        const filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.Date);
            const week = getWeekNumber(date);
            return week === parseInt(selectedWeek);
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


    const handleWeekChange = (event) => {
        setSelectedWeek(event.target.value);
    };

    return (
        <div className="transactions-container">
            <h1>All Transactions by Category</h1>
            <select value={selectedWeek} onChange={handleWeekChange}>
                {weekOptions.map(week => (
                    <option key={week} value={week}>Week {week}</option>
                ))}
            </select>
            {renderTransactionsByCategory()}
        </div>
    );
}

export default WeeklyTransactions;
