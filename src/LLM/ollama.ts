import fetch from 'node-fetch';
import { system_context_json } from './context';

export async function petition_ollama(model: string, data: any, query: string, panel: any) {

    try {

        const url = 'http://147.83.113.192:30147/ollama/api/chat';

        const messages = [
            { role: 'system', content: system_context_json }
        ];

        data.forEach((entry: any) => {
            const user_message = { role: 'user', content: entry.user };
            const assistant_message = { role: 'assistant', content: entry.assistant };
            messages.push(user_message, assistant_message);
        });

        messages.push({ role: 'user', content: `${query}` });

        const response = fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                model: model,
                messages: messages
            })
        }).then(response => response.body)
            .then(res => res.on('readable', () => {
            let chunk;
            while (null !== (chunk = res.read())) {
                const message = JSON.parse(chunk as string);
                panel.webview.postMessage({ command: 'ollamaResponse', letter: message.message.content, done: message.done });
                if (message.done) {
                    break
                }
            }
        }))

    
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function petition_ollama_full(model: string, data: any, query: string) {

    try {

        const url = 'http://147.83.113.192:30147/ollama/api/chat';

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
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false
            })
        });

        const responseData = await response.json() as any;
        return responseData.message.content;

    } catch (error) {
        console.error('Error:', error);
    }
}
