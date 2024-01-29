import axios from "axios";

const openAIEndpoint = "https://api.openai.com/v1/engines/text-davinci-003/completions";

const getAIResponse = async (prompt) => {
    try {
        const response = await axios.post(
            openAIEndpoint,
            {
                prompt: prompt,
                max_tokens: 150,  // Adjust based on your requirement
                // You can also set other parameters like temperature, top_p, etc.
            },
            {
                headers: {
                    'Authorization': `Bearer YOUR_API_KEY`,  // Replace with your actual API key
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].text;
    } catch (error) {
        console.error('Error in OpenAI request:', error);
        return null;  // Or handle the error as you see fit
    }
};

export default getAIResponse;
