import React, { useState, useEffect } from "react";

function UploadData() {
    const [file, setFile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [groupedTransactions, setGroupedTransactions] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fileReader = new FileReader();

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
    };

    const csvFileToArray = (string) => {
        const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        const data = csvRows.map((i) => {
            const values = i.split(",");
            return csvHeader.reduce((object, header, index) => {
                object[header] = values[index];
                return object;
            }, {});
        });

        setTransactions(data);
    };

    const groupByMonthAndCategory = (transactions) => {
        const groupedByMonth = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.Date);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            const category = transaction.Category || 'Other';

            if (!groupedByMonth[month]) {
                groupedByMonth[month] = {};
            }
            if (!groupedByMonth[month][category]) {
                groupedByMonth[month][category] = [];
            }

            groupedByMonth[month][category].push(transaction);
        });

        return groupedByMonth;
    };

    useEffect(() => {
        if (transactions.length > 0) {
            setIsLoading(true);
            const grouped = groupByMonthAndCategory(transactions);
            setGroupedTransactions(grouped);
            setIsLoading(false);
        }
    }, [transactions]);

    const renderGroupedTransactions = (grouped) => {
        return Object.entries(grouped).map(([month, categories]) => (
            <div key={month}>
                <h2>{month}</h2>
                {Object.entries(categories).map(([category, transactions]) => {
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
                                            <td>{transaction['Account Name']}</td>
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
                })}
            </div>
        ));
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        if (file) {
            fileReader.onload = function (event) {
                const text = event.target.result;
                csvFileToArray(text);
            };

            fileReader.readAsText(file);
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>REACTJS CSV IMPORT EXAMPLE</h1>
            <form>
                <input
                    type="file"
                    id="csvFileInput"
                    accept=".csv"
                    onChange={handleOnChange}
                />
                <button onClick={handleOnSubmit}>IMPORT CSV</button>
            </form>

            <br />

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                    renderGroupedTransactions(groupedTransactions)
                )}
        </div>
    );
}

export default UploadData;
