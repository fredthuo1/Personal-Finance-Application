import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function WeeklyTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState("");
    const [weekOptions, setWeekOptions] = useState([]);
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
            const weeks = getUniqueWeeks(transactions);
            setWeekOptions(weeks);
            setSelectedWeek(weeks[0]); // Set the default selected week
            renderChart(weeks[0]);
        }
    }, [transactions]);

    useEffect(() => {
        if (transactions.length > 0) {
            renderChart(selectedWeek);
        }
    }, [selectedWeek]);

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

    const renderChart = (week) => {
        const ctx = document.getElementById('weeklyTransactionsChart');
        const filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.Date);
            const transactionWeek = getWeekNumber(date);
            return transactionWeek === week;
        });
        const categories = [...new Set(filteredTransactions.map(transaction => transaction.Category))];
        const categoryAmounts = categories.map(category => {
            return filteredTransactions.reduce((total, transaction) => {
                return transaction.Category === category ? total + parseFloat(transaction.Amount || 0) : total;
            }, 0);
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
                    data: categoryAmounts,
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

    const handleWeekChange = (event) => {
        setSelectedWeek(parseInt(event.target.value));
    };

    const renderTransactionsList = (week) => {
        const filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.Date);
            const transactionWeek = getWeekNumber(date);
            return transactionWeek === week;
        });

        return (
            <div>
                <h2>Transactions for Week {week}</h2>
                <ul>
                    {filteredTransactions.map((transaction, index) => (
                        <li key={index}>{transaction.Description} - ${transaction.Amount}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="transactions-container">
            <h1>Weekly Transactions Chart</h1>
            <select value={selectedWeek} onChange={handleWeekChange}>
                {weekOptions.map(week => (
                    <option key={week} value={week}>Week {week}</option>
                ))}
            </select>
            <canvas id="weeklyTransactionsChart"></canvas>
            {selectedWeek && renderTransactionsList(selectedWeek)}
        </div>
    );
}

export default WeeklyTransactions;
