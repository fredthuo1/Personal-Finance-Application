import React, { useEffect } from 'react';
import styled from 'styled-components';
import Chart from 'chart.js/auto';

const SectionContainer = styled.div`
    margin: 20px 0;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: left;
`;

const SectionTitle = styled.h3`
    font-size: 1.5em;
    color: #333;
    border-bottom: 2px solid #ddd;
    padding-bottom: 10px;
`;

const SectionContent = styled.div`
    font-size: 1.2em;
    line-height: 1.6;
    color: #555;
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

const Section = ({ title, content, tableData, chartData }) => {
    useEffect(() => {
        if (chartData) {
            const ctx = document.getElementById(`chart-${title}`);
            if (ctx) {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartData.map(item => item.label),
                        datasets: [{
                            label: title,
                            data: chartData.map(item => item.value),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        }],
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    },
                });
            }
        }
    }, [chartData, title]);

    return (
        <SectionContainer>
            <SectionTitle>{title}</SectionTitle>
            <SectionContent>
                {content}
                {tableData && tableData}
                {chartData && <canvas id={`chart-${title}`} width="400" height="200"></canvas>}
            </SectionContent>
        </SectionContainer>
    );
};

export default Section;
