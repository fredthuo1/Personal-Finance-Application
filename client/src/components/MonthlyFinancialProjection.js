import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-trendline';

const Container = styled.div`
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
`;

const Button = styled.button`
    padding: 10px 20px;
    font-size: 1.2em;
    color: #fff;
    background: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:disabled {
        background: #aaa;
    }
`;

const ErrorMessage = styled.p`
    color: red;
    font-size: 1.2em;
`;

const TableContainer = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;

    th, td {
        padding: 12px;
        border: 1px solid #ddd;
    }

    th {
        background-color: #f2f2f2;
        text-align: left;
    }
`;

const SectionContainer = styled.div`
    margin-bottom: 30px;
    text-align: left;
`;

const SectionTitle = styled.h3`
    margin-bottom: 10px;
    color: #333;
`;

const SectionContent = styled.div`
    margin-bottom: 20px;
`;

const MonthlyFinancialProjection = ({ userId, transactions }) => {
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cachedAdvice = localStorage.getItem('financialAdvice_monthly');
        if (cachedAdvice) {
            const { advice } = JSON.parse(cachedAdvice);
            setAdvice(advice);
        }
    }, []);

    const handleGetAdvice = async () => {
        if (!transactions || transactions.length === 0) {
            setError("No transactions available for analysis.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/api/financial/monthly-advice', { financialData: transactions });
            const { analysis, prediction, projection } = response.data.advice;
            const advice = [analysis, prediction, projection];
            setAdvice(advice);
            localStorage.setItem('financialAdvice_monthly', JSON.stringify({ advice }));
        } catch (error) {
            console.error('Error fetching financial advice:', error);
            setError('Failed to fetch financial advice');
        } finally {
            setLoading(false);
        }
    };

    const renderTable = (data) => (
        <TableContainer>
            <thead>
                <tr>
                    {Object.keys(data[0]).map((key) => (
                        <th key={key}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {Object.values(row).map((value, i) => (
                            <td key={i}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </TableContainer>
    );

    const renderChart = (data) => {
        const labels = data.map(item => item.label);
        const values = data.map(item => item.value);

        return (
            <Bar
                data={{
                    labels,
                    datasets: [{
                        label: 'Amount',
                        data: values,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1,
                        trendlineLinear: {
                            style: "rgba(255,105,180, .8)",
                            lineStyle: "solid",
                            width: 2
                        }
                    }],
                }}
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                    plugins: {
                        trendlineLinear: {
                            style: "rgba(255,105,180, .8)",
                            lineStyle: "solid",
                            width: 2
                        }
                    }
                }}
            />
        );
    };

    const parseAdvice = (advice) => {
        return advice.map((section, index) => {
            const [title, ...content] = section.split(': ');
            let formattedContent = content.join(': ').split('\n').map((line, i) => <p key={i}>{line}</p>);
            let tableData = [];
            let chartData = [];

            const tableMatches = section.match(/- (\w+), with a total amount of \$([\d,]+\.\d{2})/g);
            if (tableMatches) {
                tableData = tableMatches.map(match => {
                    const [_, category, amount] = match.match(/- (\w+), with a total amount of \$(\d+,?\d*\.\d{2})/);
                    return { Category: category, Amount: `$${amount}` };
                });
            }

            const chartMatches = section.match(/- (\w+): \$([\d,]+\.\d{2})/g);
            if (chartMatches) {
                chartData = chartMatches.map(match => {
                    const [_, label, value] = match.match(/- (\w+): \$(\d+,?\d*\.\d{2})/);
                    return { label, value: parseFloat(value.replace(/,/g, '')) };
                });
            }

            return (
                <SectionContainer key={index}>
                    <SectionTitle>{title}</SectionTitle>
                    <SectionContent>{formattedContent}</SectionContent>
                    {tableData.length > 0 && renderTable(tableData)}
                    {chartData.length > 0 && renderChart(chartData)}
                </SectionContainer>
            );
        });
    };

    return (
        <Container>
            <h1>Monthly Financial Projection</h1>
            <Button onClick={handleGetAdvice} disabled={loading}>
                {loading ? `Fetching Advice...` : `Get Monthly Financial Advice`}
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {advice.length > 0 && (
                <>
                    <h2>ChatGPT Advice</h2>
                    <div>{parseAdvice(advice)}</div>
                </>
            )}
        </Container>
    );
};

export default MonthlyFinancialProjection;
