import React, { useState, useEffect, useRef, useContext } from "react";
import Chart from "chart.js/auto";
import { AuthContext } from '../components/AuthContext';

function MonthlyTransactions() {
    const { userId } = useContext(AuthContext); 
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const chartRef = useRef(null);

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

    useEffect(() => {
        if (transactions.length > 0) {
            renderChart();
        }
    }, [transactions, selectedMonth]);

    const renderChart = () => {
        const ctx = document.getElementById('monthlyTransactionsChart');
        const filteredTransactions = filterTransactionsByMonth(transactions, selectedMonth);
        const categories = [...new Set(filteredTransactions.map(transaction => transaction.Category || 'Other'))];
        const amounts = categories.map(category => {
            return filteredTransactions.filter(transaction => transaction.Category === category)
                .reduce((sum, transaction) => sum + parseFloat(transaction.Amount || 0), 0);
        });

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Amount',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const filterTransactionsByMonth = (transactions, month) => {
        if (!month) {
            return transactions;
        }
        return transactions.filter(transaction => {
            const date = new Date(transaction.Date);
            return date.toLocaleString('default', { month: 'short', year: 'numeric' }) === month;
        });
    };

    const renderTransactionList = (transactions) => {
        const categorizedTransactions = {};

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

    const handleGenerateReport = () => {
        window.open(`http://localhost:5000/api/transactions/generateReport/${userId}`);
    };

    return (
        <div className="transactions-container">
            <h1>Monthly Transactions Chart</h1>
            <label htmlFor="monthSelect">Select a month:</label>
            <select id="monthSelect" value={selectedMonth} onChange={handleMonthChange}>
                <option value="">All Months</option>
                {Array.from(new Set(transactions.map(transaction => {
                    const date = new Date(transaction.Date);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                }))).map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
            <canvas id="monthlyTransactionsChart"></canvas>
            <button onClick={handleGenerateReport}>Generate Report</button>
            {renderTransactionList(filterTransactionsByMonth(transactions, selectedMonth))}
        </div>
    );
}

export default MonthlyTransactions;
