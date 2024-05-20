import React, { useState, useEffect } from 'react';

const Home = () => {
    const [educationalContent, setEducationalContent] = useState('');

    useEffect(() => {
        const fetchEducationalContent = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/transactions/analyze');
                const data = await response.json();
                if (data.analysis) {
                    setEducationalContent(data.analysis);
                } else {
                    setEducationalContent(getTempEducationalContent());
                }
            } catch (error) {
                console.error('Error fetching educational content:', error);
                setEducationalContent(getTempEducationalContent());
            }
        };

        fetchEducationalContent();
    }, []);

    const getTempEducationalContent = () => {
        return `
            <h3>Understanding Your Spending Habits</h3>
            <p>To manage your finances better, it's crucial to understand your spending habits. Categorize your expenses into different categories such as groceries, entertainment, and bills. This helps in identifying areas where you can cut back and save more.</p>
            <h3>Setting Financial Goals</h3>
            <p>Set realistic financial goals for yourself. Whether it's saving for a vacation, paying off debt, or building an emergency fund, having clear goals helps in staying focused and motivated.</p>
            <h3>Building an Emergency Fund</h3>
            <p>An emergency fund is essential to cover unexpected expenses. Aim to save at least three to six months’ worth of living expenses. This provides a financial cushion and peace of mind.</p>
        `;
    };

    return (
        <div className="home-container">
            <h1>Welcome to Personal Finance Advisor</h1>
            <p>Your one-stop solution for managing your personal finances efficiently. Track your expenses, analyze spending habits, and gain insights to make better financial decisions.</p>
            <button className="get-started-btn">Get Started</button>

            <div className="educational-section">
                <h2>Financial Education</h2>
                {educationalContent ? (
                    <div dangerouslySetInnerHTML={{ __html: educationalContent }} />
                ) : (
                        <p>Loading educational content...</p>
                    )}
            </div>
        </div>
    );
}

export default Home;
