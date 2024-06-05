const openai = require('openai');
openai.apiKey = process.env.OPENAI_API_KEY;

const analyzeTransactionsAndGenerateContent = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const transactions = await Transaction.find({ UserID: userId });

        if (transactions.length === 0) {
            return res.status(200).json({ analysis: '' });
        }

        let prompt = `Provide an educational blog-like summary of monthly expenses by category based on the following transactions:\n`;
        transactions.forEach((t, index) => {
            prompt += `${index + 1}. Date: ${t.Date}, Category: ${t.Category}, Amount: $${t.Amount}\n`;
        });

        const response = await openai.Completion.create({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 500,
        });

        const analysis = response.choices[0].text;
        res.status(200).json({ analysis });
    } catch (error) {
        console.error('Error analyzing transactions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    analyzeTransactionsAndGenerateContent,
};
