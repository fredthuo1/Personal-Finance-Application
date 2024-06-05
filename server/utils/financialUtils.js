const openai = require('../config/openai');
const chunkArray = require('../utils/chunkArray');
const { broadcast } = require('../config/websocket');

const analyzeFinancialData = async (financialData, period) => {
    if (!financialData) {
        throw new Error("Financial data is null or undefined.");
    }

    const chunkSize = 50;
    const dataChunks = chunkArray(financialData, chunkSize);

    const analysisResults = [];
    const predictionResults = [];
    const projectionResults = [];
    const financialTips = [];

    try {
        for (let i = 0; i < dataChunks.length; i++) {
            const chunk = dataChunks[i];

            const analysisPrompt = `
Analyze the following financial data to provide ${period} financial advice:
${JSON.stringify(chunk, null, 2)}

Please provide insights on:
1. Categories with the highest spending.
2. Unusual spending patterns.
3. Any noticeable trends in the data.
`;
            console.log(`Sending analysis request for chunk ${i + 1}/${dataChunks.length}`);
            const analysisResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: analysisPrompt }],
                max_tokens: 300,
                temperature: 0.5,
            });

            console.log(`Analysis response for chunk ${i + 1}/${dataChunks.length}:`, JSON.stringify(analysisResponse, null, 2));

            const analysisContent = analysisResponse.choices[0] ?.message ?.content;
            if (!analysisContent) {
                console.error(`Invalid response format for analysis: ${JSON.stringify(analysisResponse.data)}`);
                throw new Error(`Invalid response format for analysis: ${JSON.stringify(analysisResponse.data)}`);
            }

            const predictionPrompt = `
Based on these financial data, predict the financial outlook for the upcoming ${period}. 
Please provide feedback on how the user can manage their finances better, including potential savings and investment opportunities:
${JSON.stringify(chunk, null, 2)}
`;
            console.log(`Sending prediction request for chunk ${i + 1}/${dataChunks.length}`);
            const predictionResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: predictionPrompt }],
                max_tokens: 300,
                temperature: 0.5,
            });

            console.log(`Prediction response for chunk ${i + 1}/${dataChunks.length}:`, JSON.stringify(predictionResponse, null, 2));

            const predictionContent = predictionResponse.choices[0] ?.message ?.content;
            if (!predictionContent) {
                console.error(`Invalid response format for prediction: ${JSON.stringify(predictionResponse.data)}`);
                throw new Error(`Invalid response format for prediction: ${JSON.stringify(predictionResponse.data)}`);
            }

            const projectionPrompt = `
Based on the advice provided and the financial data, project the financial outcome for the user if they follow the advice. 
Include projections for:
1. Potential savings over the ${period}.
2. Debt payoff timeline.
3. Investment growth.
${JSON.stringify(chunk, null, 2)}
`;
            console.log(`Sending projection request for chunk ${i + 1}/${dataChunks.length}`);
            const projectionResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: projectionPrompt }],
                max_tokens: 300,
                temperature: 0.5,
            });

            console.log(`Projection response for chunk ${i + 1}/${dataChunks.length}:`, JSON.stringify(projectionResponse, null, 2));

            const projectionContent = projectionResponse.choices[0] ?.message ?.content;
            if (!projectionContent) {
                console.error(`Invalid response format for projection: ${JSON.stringify(projectionResponse.data)}`);
                throw new Error(`Invalid response format for projection: ${JSON.stringify(projectionResponse.data)}`);
            }

            const tipsPrompt = `
Based on the following financial data, provide financial tips for better decision making in the upcoming ${period}:
${JSON.stringify(chunk, null, 2)}
`;
            console.log(`Sending tips request for chunk ${i + 1}/${dataChunks.length}`);
            const tipsResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: tipsPrompt }],
                max_tokens: 300,
                temperature: 0.5,
            });

            console.log(`Tips response for chunk ${i + 1}/${dataChunks.length}:`, JSON.stringify(tipsResponse, null, 2));

            const tipsContent = tipsResponse.choices[0] ?.message ?.content;
            if (!tipsContent) {
                console.error(`Invalid response format for tips: ${JSON.stringify(tipsResponse.data)}`);
                throw new Error(`Invalid response format for tips: ${JSON.stringify(tipsResponse.data)}`);
            }

            analysisResults.push(analysisContent.trim());
            predictionResults.push(predictionContent.trim());
            projectionResults.push(projectionContent.trim());
            financialTips.push(tipsContent.trim());

            console.log(`Broadcasting progress: chunk ${i + 1}/${dataChunks.length}`);
            broadcast({ type: 'progress', chunkIndex: i + 1, totalChunks: dataChunks.length });
        }

        return {
            analysis: analysisResults.join('\n\n'),
            prediction: predictionResults.join('\n\n'),
            projection: projectionResults.join('\n\n'),
            tips: financialTips.join('\n\n'),
        };
    } catch (error) {
        console.error(`Error in analyzeFinancialData (${period}):`, error.message);
        console.error(`Error stack: ${error.stack}`);
        throw new Error(`Failed to analyze financial data for ${period}`);
    }
};

module.exports = { analyzeFinancialData };
