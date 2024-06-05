import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../components/AuthContext';
import Chart from "chart.js/auto";
import Carousel from '../components/Carousel';
import axios from 'axios';
import WeeklyFinancialProjection from "../components/WeeklyFinancialProjection";

function WeeklyTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState("");
    const [weekOptions, setWeekOptions] = useState([]);
    const [analysis, setAnalysis] = useState([]);
    const [prediction, setPrediction] = useState([]);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef(null);
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

    useEffect(() => {
        if (transactions.length > 0) {
            const weeks = getUniqueWeeks(transactions);
            setWeekOptions(weeks);
            setSelectedWeek(weeks[0].weekNumber);
            renderChart(weeks[0].weekNumber);
        }
    }, [transactions]);

    useEffect(() => {
        if (transactions.length > 0) {
            renderChart(selectedWeek);
        }
    }, [selectedWeek]);

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

    const getUniqueWeeks = (transactions) => {
        const weeksMap = new Map();
        transactions.forEach(transaction => {
            const date = new Date(transaction.Date);
            const weekNumber = getWeekNumber(date);
            const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            const weekLabel = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
            weeksMap.set(weekNumber, { weekNumber, weekLabel });
        });
        return Array.from(weeksMap.values()).sort((a, b) => a.weekNumber - b.weekNumber);
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
        const categories = [...new Set(filteredTransactions.map(transaction => transaction.EnrichedCategory || 'Other'))];
        const categoryAmounts = categories.map(category => {
            return filteredTransactions.reduce((total, transaction) => {
                return transaction.EnrichedCategory === category ? total + parseFloat(transaction.Amount || 0) : total;
            }, 0);
        });

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'line', // Change type to 'line'
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

    const handleWeekChange = (event) => {
        setSelectedWeek(parseInt(event.target.value));
    };

    const handleAnalyzeWeeklyTransactions = async () => {
        setLoading(true);
        try {
            const filteredTransactions = transactions.filter(transaction => {
                const date = new Date(transaction.Date);
                const transactionWeek = getWeekNumber(date);
                return transactionWeek === selectedWeek;
            });
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

    const renderTransactionsList = (week) => {
        const filteredTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.Date);
            const transactionWeek = getWeekNumber(date);
            return transactionWeek === week;
        });

        const categorizedTransactions = {};

        filteredTransactions.forEach(transaction => {
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

    return (
        <div className="transactions-container">
            <h1>Weekly Transactions Chart</h1>
            <select value={selectedWeek} onChange={handleWeekChange}>
                {weekOptions.map(({ weekNumber, weekLabel }) => (
                    <option key={weekNumber} value={weekNumber}>Week {weekNumber} ({weekLabel})</option>
                ))}
            </select>
            <canvas id="weeklyTransactionsChart"></canvas>
            <button onClick={handleAnalyzeWeeklyTransactions} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Weekly Transactions'}
            </button>
            {loading && <p>Progress: {progress}%</p>}
            <WeeklyFinancialProjection userId={userId} transactions={transactions.filter(transaction => {
                const date = new Date(transaction.Date);
                const transactionWeek = getWeekNumber(date);
                return transactionWeek === selectedWeek;
            })} />
            {analysis.length > 0 && (
                <>
                    <h2>Weekly Analysis</h2>
                    <Carousel items={parseAnalysis(analysis)} />
                </>
            )}
            {prediction.length > 0 && (
                <>
                    <h2>Spending Prediction</h2>
                    <Carousel items={parseAnalysis(prediction)} />
                </>
            )}
            {selectedWeek && renderTransactionsList(selectedWeek)}
        </div>
    );
}

export default WeeklyTransactions;
