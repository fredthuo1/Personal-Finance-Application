import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Bar, Line } from 'react-chartjs-2';
import FinancialProfileForm from '../components/FinancialProfileForm';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 1.2em;
`;

const TableContainer = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;

  th,
  td {
    padding: 12px;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f2f2f2;
    text-align: left;
  }
`;

const ChartsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const ChartWrapper = styled.div`
  flex: 1;
  margin: 10px;
  min-width: 400px;
`;

const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        return parsedPayload.user ? parsedPayload.user.id : null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const ComparisonDashboard = () => {
    const [data, setData] = useState(null);
    const [transactionData, setTransactionData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateProfile, setShowCreateProfile] = useState(false);

    const token = localStorage.getItem('token');
    const userId = decodeToken(token);

    const fetchComparisonData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/profile/${userId}/comparison`);
            setData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            if (error.response && error.response.status) {
                if (error.response.status === 404) {
                    setError('User does not have a financial profile');
                    setShowCreateProfile(true);
                } else {
                    setError(`Failed to fetch comparison data. Server responded with status: ${error.response.status}`);
                }
            } else if (error.request) {
                setError('No response received from server. Please check your connection.');
            } else {
                setError('Error setting up the request to fetch data.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTransactionComparisonData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/transactions/${userId}/comparison/`);
            setTransactionData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching transaction comparison data:', error);
            if (error.response && error.response.status) {
                if (error.response.status === 404) {
                    setError('User does not have transaction data');
                } else {
                    setError(`Failed to fetch transaction comparison data. Server responded with status: ${error.response.status}`);
                }
            } else if (error.request) {
                setError('No response received from server. Please check your connection.');
            } else {
                setError('Error setting up the request to fetch data.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchComparisonData();
            fetchTransactionComparisonData();
        } else {
            setError('User not logged in');
            setIsLoading(false);
        }
    }, [userId]);

    const handleProfileSubmit = async (formData) => {
        try {
            await axios.post(`http://localhost:5000/api/profile/`, formData);
            fetchComparisonData();
            setError(null);
            setShowCreateProfile(false);
        } catch (error) {
            console.error('Error creating financial profile:', error);
            setError('Failed to create profile. Please try again.');
        }
    };

    const renderChart = (userMetrics, averageComparisonMetrics) => {
        const labels = ['Debt', 'Net Worth'];
        const userData = [userMetrics.debt, userMetrics.netWorth];
        const averageData = [averageComparisonMetrics.debt, averageComparisonMetrics.netWorth];

        return (
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: 'You',
                            data: userData,
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Average for All Users',
                            data: averageData,
                            backgroundColor: 'rgba(75, 192, 192, 0.4)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                }}
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />
        );
    };

    const renderAssetsLiabilitiesComparisonChart = (userMetrics, averageComparisonMetrics) => {
        const labels = ['Cash and Savings', 'Investments', 'Real Estate', 'Personal Property', 'Other Assets', 'Credit Card Debt', 'Other Liabilities'];
        if (!userMetrics || !averageComparisonMetrics) return null;

        const userData = [
            userMetrics.cashAndSavings,
            userMetrics.investments,
            userMetrics.realEstate,
            userMetrics.personalProperty,
            userMetrics.otherAssets,
            userMetrics.creditCardDebt,
            userMetrics.otherLiabilities
        ];
        const averageData = [
            averageComparisonMetrics.cashAndSavings,
            averageComparisonMetrics.investments,
            averageComparisonMetrics.realEstate,
            averageComparisonMetrics.personalProperty,
            averageComparisonMetrics.otherAssets,
            averageComparisonMetrics.creditCardDebt,
            averageComparisonMetrics.otherLiabilities
        ];

        return (
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: 'You',
                            data: userData,
                            backgroundColor: 'rgba(255, 206, 86, 0.6)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Average for All Users',
                            data: averageData,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                    ],
                }}
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />
        );
    };

    const renderOverallComparisonChart = (userCategories, averageCategories) => {
        if (!userCategories || !averageCategories) {
            return null;
        }

        const labels = Object.keys(userCategories);
        const userData = labels.map(label => userCategories[label].amount);
        const averageData = labels.map(label => averageCategories[label] ?.averageAmount || 0);

        return (
            <Line
                data={{
                    labels,
                    datasets: [
                        {
                            label: 'You',
                            data: userData,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            fill: false,
                        },
                        {
                            label: 'Average for All Users',
                            data: averageData,
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            fill: false,
                        },
                    ],
                }}
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />
        );
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        if (error === 'User does not have a financial profile' && showCreateProfile) {
            return (
                <Container>
                    <ErrorMessage>
                        You haven't created a financial profile yet.
                    </ErrorMessage>
                    <FinancialProfileForm onSubmit={handleProfileSubmit} userId={userId} />
                </Container>
            );
        } else {
            return <ErrorMessage>{error}</ErrorMessage>;
        }
    }

    if (!data) {
        return (
            <Container>
                <ErrorMessage>No data available.</ErrorMessage>
                {showCreateProfile && <FinancialProfileForm onSubmit={handleProfileSubmit} userId={userId} />}
            </Container>
        );
    }

    const { userMetrics, averageComparisonMetrics, numProfilesCompared } = data;

    return (
        <Container>
            <h1>Comparison Dashboard</h1>

            <p>Number of profiles compared: {numProfilesCompared}</p>

            <ChartsContainer>
                <ChartWrapper>
                    {renderChart(userMetrics, averageComparisonMetrics)}
                </ChartWrapper>

                <ChartWrapper>
                    {renderAssetsLiabilitiesComparisonChart(userMetrics, averageComparisonMetrics)}
                </ChartWrapper>
            </ChartsContainer>

            <TableContainer>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Your Value</th>
                        <th>Average for All Users</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Debt</td>
                        <td>${userMetrics.debt ? userMetrics.debt.toFixed(2) : 'N/A'}</td>
                        <td>${averageComparisonMetrics.debt ? averageComparisonMetrics.debt.toFixed(2) : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Net Worth</td>
                        <td>${userMetrics.netWorth ? userMetrics.netWorth.toFixed(2) : 'N/A'}</td>
                        <td>${averageComparisonMetrics.netWorth ? averageComparisonMetrics.netWorth.toFixed(2) : 'N/A'}</td>
                    </tr>
                </tbody>
            </TableContainer>

            <ChartWrapper>
                {transactionData && renderOverallComparisonChart(transactionData.userCategories, transactionData.averageCategories)}
            </ChartWrapper>
        </Container>
    );
};

export default ComparisonDashboard;

