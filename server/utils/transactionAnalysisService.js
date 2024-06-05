const openai = require('../config/openai');
const chunkArray = require('../utils/chunkArray');
const { broadcast } = require('../config/websocket');

const analyzeTransactions = async (transactions) => {
    const chunkSize = 50;
    const transactionChunks = chunkArray(transactions, chunkSize);

    const analysisResults = [];
    const predictionResults = [];

    try {
        for (let i = 0; i < transactionChunks.length; i++) {
            const chunk = transactionChunks[i];

            const analysisPrompt = `
        Analyze the following transactions to identify spending behaviors and patterns:
        ${JSON.stringify(chunk, null, 2)}
        
        Provide insights on:
        1. Categories with the highest spending.
        2. Unusual spending patterns.
        3. Any noticeable trends in the data.
      `;
            const analysisResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: analysisPrompt }],
                max_tokens: 300,
                temperature: 0.5,
            });

            const predictionPrompt = `
        Based on these past transactions, predict the spending for the upcoming week. Provide feedback on how the user can manage their spending better.
        ${JSON.stringify(chunk, null, 2)}
      `;
            const predictionResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: predictionPrompt }],
                max_tokens: 300,
                temperature: 0.5,
            });

            analysisResults.push(analysisResponse.choices[0].message.content.trim());
            predictionResults.push(predictionResponse.choices[0].message.content.trim());

            // Send progress update
            broadcast({ type: 'progress', chunkIndex: i + 1, totalChunks: transactionChunks.length });
        }

        return {
            analysis: analysisResults.join('\n\n'),
            prediction: predictionResults.join('\n\n'),
        };
    } catch (error) {
        console.error("Error analyzing transactions:", error);
        throw new Error("Failed to analyze transactions");
    }
};

module.exports = { analyzeTransactions };