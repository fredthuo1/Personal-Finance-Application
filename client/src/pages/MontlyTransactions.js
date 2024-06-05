import React, { useState, useEffect, useRef, useContext } from "react";
import Chart from "chart.js/auto";
import { AuthContext } from '../components/AuthContext';
import Carousel from '../components/Carousel';
import axios from 'axios';
import MonthlyFinancialProjection from "../components/MonthlyFinancialProjection";

function MonthlyTransactions() {
    const { userId } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [analysis, setAnalysis] = useState([]);
    const [prediction, setPrediction] = useState([]);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5000');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'progress') {
                setProgress((data.chunkIndex / data.totalChunks) * 100);
            }
        };

        return () => ws.close();
    }, []);

    const renderChart = () => {
        const ctx = document.getElementById('monthlyTransactionsChart');
        const filteredTransactions = filterTransactionsByMonth(transactions, selectedMonth);
        const categories = [...new Set(filteredTransactions.map(transaction => transaction.EnrichedCategory || 'Other'))];
        const amounts = categories.map(category => {
            return filteredTransactions.filter(transaction => transaction.EnrichedCategory === category)
                .reduce((sum, transaction) => sum + parseFloat(transaction.Amount || 0), 0);
        });

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Amount',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    annotation: {
                        annotations: categories.map(category => ({
                            type: 'line',
                            mode: 'linear',
                            scaleID: 'x',
                            value: category,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: category,
                                enabled: true
                            }
                        }))
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
            const category = transaction.EnrichedCategory || 'Other';
            if (!categorizedTransactions[category]) {
                categorizedTransactions[category] = [];
            }
            categorizedTransactions[category].push(transaction);
        });

        return Object.entries(categorizedTransactions).map(([category, transactions]) => {
            const totalAmount = transactions.reduce((total, transaction) => (
                total + parseFloat(transaction.Amount || 0)
            ), 0);

            return (
                <div key={category}>
                    <h3>{category}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Category</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={index}>
                                    <td>{transaction.Date}</td>
                                    <td>{transaction.Description}</td>
                                    <td>${transaction.Amount}</td>
                                    <td>{transaction.EnrichedCategory}</td>
                                    <td>{transaction.Amount}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'right' }}>Total:</td>
                                <td>${totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        });
    };

    const handleGenerateReport = () => {
        window.open(`http://localhost:5000/api/transactions/generateReport/${userId}`);
    };

    const handleAnalyzeMonthlyTransactions = async () => {
        setLoading(true);
        setProgress(0);
        try {
            const filteredTransactions = filterTransactionsByMonth(transactions, selectedMonth);
            const response = await axios.post('http://localhost:5000/api/transactions/analyze', { transactions: filteredTransactions });
            setAnalysis(response.data.analysis.split('\n\n'));
            setPrediction(response.data.prediction.split('\n\n'));
        } catch (error) {
            console.error('Error analyzing transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderSection = (title, content) => (
        <div className="section">
            <h3>{title}</h3>
            <p>{content}</p>
        </div>
    );

    const parseAnalysis = (analysis) => {
        return analysis.map((section, index) => {
            const [title, ...content] = section.split(': ');
            return renderSection(title, content.join(': '));
        });
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
            <MonthlyFinancialProjection userId={userId} period="monthly" transactions={filterTransactionsByMonth(transactions, selectedMonth)} />
            <canvas id="monthlyTransactionsChart"></canvas>
            <button onClick={handleGenerateReport}>Generate Report</button>
            <button onClick={handleAnalyzeMonthlyTransactions} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Monthly Transactions'}
            </button>
            {loading && <p>Progress: {progress}%</p>}
            {analysis.length > 0 && (
                <>
                    <h2>Monthly Analysis</h2>
                    <Carousel items={parseAnalysis(analysis)} />
                </>
            )}
            {prediction.length > 0 && (
                <>
                    <h2>Spending Prediction</h2>
                    <Carousel items={parseAnalysis(prediction)} />
                </>
            )}
            {renderTransactionList(filterTransactionsByMonth(transactions, selectedMonth))}
        </div>
    );
}

export default MonthlyTransactions;
