import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';


const TransactionAnalysis = ({ transactions = [] }) => {
    const [analysis, setAnalysis] = useState('');
    const [prediction, setPrediction] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/transactions/analyze', { transactions });
            setAnalysis(response.data.analysis);
            setPrediction(response.data.prediction);
        } catch (error) {
            console.error('Error analyzing transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleAnalyze} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Transactions'}
            </button>
            {analysis && (
                <div>
                    <h3>Analysis</h3>
                    <p>{analysis}</p>
                </div>
            )}
            {prediction && (
                <div>
                    <h3>Prediction</h3>
                    <p>{prediction}</p>
                </div>
            )}
        </div>
    );
};


export default TransactionAnalysis;
