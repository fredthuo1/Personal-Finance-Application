import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";

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
        const amounts = calculateCategoryAmounts(filteredTransactions, categories);

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

    // Function to filter transactions by selected month
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
            const category = transaction.Category || 'Other';
            categoriesSet.add(category);
        });
        return Array.from(categoriesSet);
    };

    const calculateCategoryAmounts = (transactions, categories) => {
        const amounts = new Array(categories.length).fill(0);
        transactions.forEach(transaction => {
            const categoryIndex = categories.indexOf(transaction.Category || 'Other');
            amounts[categoryIndex] += parseFloat(transaction.Amount || 0);
        });
        return amounts;
    };

    const renderTransactionList = (transactions) => {
        // Group transactions by category
        const groupedTransactions = {};
        transactions.forEach(transaction => {
            const category = transaction.Category || 'Other';
            if (!groupedTransactions[category]) {
                groupedTransactions[category] = [];
            }
            groupedTransactions[category].push(transaction);
        });

        // Render transaction list grouped by category
        return (
            <div>
                {Object.entries(groupedTransactions).map(([category, transactions]) => (
                    <div key={category} className="transaction-list">
                        <h2>{category}</h2>
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
                ))}
            </div>
        );
    };

    const handleReportCreation = async () => {
        const doc = new jsPDF();
        doc.text("Monthly Transactions Report", 10, 10);
        doc.text(`Selected Month: ${selectedMonth}`, 10, 20);

        const source = document.createElement("div");
        source.id = "pdf-source";  // Assign an ID to the source element for easy reference
        source.innerHTML = renderTransactionListToHTML(filterTransactionsByMonth(transactions, selectedMonth));
        source.style.visibility = 'hidden';
        source.style.position = 'absolute';
        source.style.left = '0';
        source.style.top = '0';
        document.body.appendChild(source);

        setTimeout(() => {
            doc.html(source, {
                callback: function (doc) {
                    doc.save("monthly_transactions_report.pdf");
                    document.body.removeChild(source);
                },
                x: 10,
                y: 30,
                html2canvas: {
                    scale: 0.5,
                    onclone: (clonedDoc) => {
                        const clonedSource = clonedDoc.getElementById("pdf-source");
                        if (clonedSource) {
                            clonedSource.style.visibility = 'visible';
                        }
                    }
                }
            });
        }, 1000);  
    };

    const renderTransactionListToHTML = (transactions) => {
        let html = '<h2>Transaction List</h2>';
        transactions.forEach(transaction => {
            html += `
            <div>
                <span>Date: ${transaction.Date}</span>
                <span>Description: ${transaction.Description}</span>
                <span>Amount: $${transaction.Amount}</span>
            </div>
        `;
        });
        return html;
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
            <button onClick={handleReportCreation}>Create Report</button>
            {renderTransactionList(filterTransactionsByMonth(transactions, selectedMonth))}
        </div>
    );
}

export default MonthlyTransactions;
