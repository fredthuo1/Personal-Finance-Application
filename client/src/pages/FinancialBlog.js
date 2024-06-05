import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import styled from 'styled-components';

const BlogContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
`;

const Title = styled.h1`
    text-align: center;
    color: #333;
`;

const Section = styled.div`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
    background-color: #007bff;
    color: white;
    padding: 10px;
    border-radius: 5px;
`;

const Tips = styled.p`
    background-color: #f9f9f9;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    line-height: 1.6;
`;

const Progress = styled.p`
    text-align: center;
    color: #007bff;
    font-size: 1.2em;
`;

const FinancialBlog = () => {
    const { userId } = useAuth();
    const [weeklyTips, setWeeklyTips] = useState(null);
    const [monthlyTips, setMonthlyTips] = useState(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/blog/${userId}`);
                const { weeklyAdvice, monthlyAdvice } = response.data;
                setWeeklyTips(weeklyAdvice.tips);
                setMonthlyTips(monthlyAdvice.tips);
            } catch (error) {
                console.error('Error fetching blog data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBlogData();
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

    return (
        <BlogContainer>
            <Title>Financial Blog</Title>
            {loading ? (
                <>
                    <Progress>Loading... {progress}%</Progress>
                    {progress < 100 && <Progress>Analyzing data... Please wait.</Progress>}
                </>
            ) : (
                    <>
                        <Section>
                            <SectionTitle>This Week's Financial Tips</SectionTitle>
                            <Tips>{weeklyTips}</Tips>
                        </Section>
                        <Section>
                            <SectionTitle>This Month's Financial Tips</SectionTitle>
                            <Tips>{monthlyTips}</Tips>
                        </Section>
                    </>
                )}
        </BlogContainer>
    );
}

export default FinancialBlog;
