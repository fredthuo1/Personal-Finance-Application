const { OpenAIApi } = require('openai');

class TransactionAnalyzer {
    constructor() {
        this.openai = new OpenAIApi({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async analyzeTransaction(transaction) {
        try {
            const prompt = this.createPrompt(transaction);
            const response = await this.openai.createCompletion({
                model: "ftjob-0LtDiN82Y3wGfzyp6RuJUU8A", 
                prompt: prompt,
                max_tokens: 150,  
                temperature: 0.5  
            });
            return response.data.choices[0].text.trim();
        } catch (error) {
            console.error('Failed to analyze transaction:', error);
            throw error;
        }
    }

    createPrompt(transaction) {
        return `Transaction details: Date: ${transaction.date}, Amount: ${transaction.amount}, Description: ${transaction.description}, Category: ${transaction.category}. Please analyze the transaction for any anomalies or important characteristics.`;
    }
}

module.exports = TransactionAnalyzer;
