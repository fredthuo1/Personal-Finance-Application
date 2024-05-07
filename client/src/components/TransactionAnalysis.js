import React, { useState } from 'react';

const TransactionAnalysis = ({ transactions }) => {
    const [analysis, setAnalysis] = useState("");
    const [period, setPeriod] = useState('monthly'); // Default to monthly

    const generateAnalysisPrompt = (transactions, period) => {
        if (transactions.length === 0) {
            return "No transactions available for analysis.";
        }

        let prompt = `Provide a summary of ${period} expenses by category based on the following transactions:\n`;
        transactions.forEach((t, index) => {
            prompt += `${index + 1}. Date: ${t.Date}, Category: ${t.Category}, Amount: $${t.Amount}\n`;
        });

        return prompt;
    };

    const analyzeTransactionsWithAI = async (prompt) => {
        const openAIKey = process.env.REACT_APP_OPENAI_API_KEY; // Ensure your API key is stored securely
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openAIKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch AI analysis.");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    };

    const handleAnalyzeClick = async () => {
        const prompt = generateAnalysisPrompt(transactions, period);
        try {
            const analysisResult = await analyzeTransactionsWithAI(prompt);
            setAnalysis(analysisResult);
        } catch (error) {
            console.error("Error during transaction analysis: ", error);
            setAnalysis("Failed to analyze transactions.");
        }
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

    return (
        <div>
            <select value={period} onChange={handlePeriodChange}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
            </select>
            <button onClick={handleAnalyzeClick}>Analyze Transactions</button>
            <div>{analysis}</div>
        </div>
    );
};

export default TransactionAnalysis;
