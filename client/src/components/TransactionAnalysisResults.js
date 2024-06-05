import React from 'react';
import Carousel from './Carousel';

const TransactionAnalysisResults = ({ analysis, prediction }) => {
    const renderSection = (title, content) => (
        <div className="section">
            <h3>{title}</h3>
            <p>{content}</p>
        </div>
    );

    const parseAnalysis = (text) => {
        const sections = text.split('\n\n');
        return sections.map((section, index) => {
            const [title, ...content] = section.split(': ');
            return renderSection(title, content.join(': '));
        });
    };

    const analysisItems = parseAnalysis(analysis);
    const predictionItems = parseAnalysis(prediction);

    return (
        <div className="analysis-results-container">
            <h2>Transaction Analysis</h2>
            <Carousel items={analysisItems} />
            <h2>Spending Prediction</h2>
            <Carousel items={predictionItems} />
        </div>
    );
};

export default TransactionAnalysisResults;
