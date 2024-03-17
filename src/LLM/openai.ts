import fetch from 'node-fetch';
import { system_context_json } from './context';

export async function petition_openai(api_key: string, data: any, query: string) {
    const apiKey = api_key;
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
        const messages = [
            { role: 'system', content: system_context_json }
        ];

        data.forEach((entry: any) => {
            const user_message = { role: 'user', content: entry.user };
            const assistant_message = { role: 'assistant', content: entry.assistant };
            messages.push(user_message, assistant_message);
        });

        messages.push({ role: 'user', content: `${query}` });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.8
            })
        });

        const responseData = await response.json() as OpenAIResponse;
        return responseData.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
    }
}

interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}
