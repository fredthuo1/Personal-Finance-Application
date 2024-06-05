import React, { useState, useEffect } from "react";
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import TransactionAnalysisResults from '../components/TransactionAnalysisResults';
import FinancialProjection from '../components/FinancialProjection';
import Chart from 'chart.js/auto'; 

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [analysis, setAnalysis] = useState('');
    const [prediction, setPrediction] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { userId } = useAuth();
    const chartRef = React.createRef(); 

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
        const ws = new WebSocket('ws://localhost:5000');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'progress') {
                setProgress((data.chunkIndex / data.totalChunks) * 100);
            }
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            renderChart();
        }
    }, [transactions]);

    const renderTransactionsByCategory = () => {
        const categorizedTransactions = {};

        if (!Array.isArray(transactions)) {
            return <p>No transactions found.</p>;
        }

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
                                <th>Transaction Type</th>
                                <th>Category</th>
                                <th>Account Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={index}>
                                    <td>{transaction.Date}</td>
                                    <td>{transaction.Description}</td>
                                    <td>${transaction.Amount}</td>
                                    <td>{transaction['Transaction Type']}</td>
                                    <td>{transaction.Category}</td>
                                    <td>{transaction.Amount}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'right' }}>Total:</td>
                                <td>${totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        });
    };

    const renderChart = () => {
        const ctx = chartRef.current.getContext('2d');

        const categories = [...new Set(transactions.map(transaction => transaction.EnrichedCategory))];

        const groupedTransactions = {};
        transactions.forEach(transaction => {
            const category = transaction.EnrichedCategory || 'Other';
            const month = new Date(transaction.Date).toLocaleString('default', { month: 'long' });

            if (!groupedTransactions[category]) {
                groupedTransactions[category] = {};
            }

            if (!groupedTransactions[category][month]) {
                groupedTransactions[category][month] = [];
            }

            groupedTransactions[category][month].push(parseFloat(transaction.Amount));
        });

        const chartData = {
            labels: Object.keys(groupedTransactions[categories[0]] || {}),
            datasets: categories.map(category => ({
                label: category,
                data: Object.values(groupedTransactions[category] || {}).map(monthData => monthData.reduce((acc, val) => acc + val, 0)),
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.4
            }))
        };

        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Expense Trends by Category'
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setProgress(0);
        try {
            const response = await axios.post('http://localhost:5000/api/transactions/analyze', { transactions });
            setAnalysis(response.data.analysis);
            setPrediction(response.data.prediction);
        } catch (error) {
            console.error('Error analyzing transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transactions-container">
            <h1>All Transactions by Category</h1>
            <button onClick={handleAnalyze} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Transactions'}
            </button>
            <FinancialProjection userId={userId} period="yearly" transactions={transactions} />
            {loading && <p>Progress: {progress}%</p>}
            {analysis && (
                <TransactionAnalysisResults analysis={analysis} prediction={prediction} />
            )}
            <div className="chart-container">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="transactions-list">{renderTransactionsByCategory()}</div>
        </div>
    );
}

export default Transactions;
