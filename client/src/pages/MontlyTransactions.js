import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function MonthlyTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const chartRef = useRef(null);

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
            renderChart();
        }
    }, [transactions, selectedMonth]); // Include selectedMonth in the dependency array

    const renderChart = () => {
        const ctx = document.getElementById('monthlyTransactionsChart');
        const filteredTransactions = filterTransactionsByMonth(transactions, selectedMonth);
        const categories = getUniqueCategories(filteredTransactions);
        const categoryTotals = calculateCategoryTotals(filteredTransactions, categories);

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Monthly Total',
                    data: categoryTotals,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Amount ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Category'
                        }
                    }
                }
            }
        });

        // Render transaction list
        renderTransactionList(filteredTransactions);
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

    const getUniqueCategories = (transactions) => {
        const categoriesSet = new Set();
        transactions.forEach(transaction => {
            categoriesSet.add(transaction.Category || 'Other');
        });
        return Array.from(categoriesSet);
    };

    const calculateCategoryTotals = (transactions, categories) => {
        const categoryTotals = categories.map(category => {
            return transactions
                .filter(transaction => transaction.Category === category)
                .reduce((total, transaction) => total + parseFloat(transaction.Amount || 0), 0);
        });
        return categoryTotals;
    };

    const renderTransactionList = (transactions) => {
        return (
            <div className="transaction-list">
                <h2>Transactions List</h2>
                <ul>
                    {transactions.map((transaction, index) => (
                        <li key={index}>
                            <span>{transaction.Date}</span>
                            <span>{transaction.Description}</span>
                            <span>${transaction.Amount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="transactions-container">
            <h1>Monthly Transactions Chart</h1>
            <label htmlFor="monthSelect">Select a month:</label>
            <select id="monthSelect" value={selectedMonth} onChange={handleMonthChange}>
                <option value="">All Months</option>
                {/* Add options for each unique month in transactions */}
                {Array.from(new Set(transactions.map(transaction => {
                    const date = new Date(transaction.Date);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                }))).map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
            <div className="chart-container">
                <canvas id="monthlyTransactionsChart"></canvas>
            </div>
            {renderTransactionList(filterTransactionsByMonth(transactions, selectedMonth))}
        </div>
    );
}

export default MonthlyTransactions;
