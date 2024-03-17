import fetch from 'node-fetch';
import { system_context_json } from './context';
import { Client } from 'ssh2'; 

async function createSSHTunnel() {
    return new Promise<{ conn: Client; message: string }>((resolve, reject) => {
        const sshConfig = {
            host: '147.83.113.192',
            port: 30146,
            username: 'alba',
            password: 'llama123'
        };

        const forwardConfig = {
            srcHost: '127.0.0.1',
            srcPort: 11434,
            dstHost: 'localhost',
            dstPort: 11434
        };

        const conn = new Client();

        conn.on('ready', () => {
            conn.forwardOut(
                forwardConfig.srcHost,
                forwardConfig.srcPort,
                forwardConfig.dstHost,
                forwardConfig.dstPort,
                (err, stream) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ conn: conn, message: `SSH tunnel established to ${sshConfig.host}:${forwardConfig.dstPort}` });
                }
            );
        }).connect(sshConfig);
    });
}

async function closeSSHTunnel(conn: Client) {
    return new Promise<void>((resolve, reject) => {
        conn.end();
        conn.on('close', () => {
            resolve();
        });
    });
}

export async function petition_ollama(model: string, data: any, query: string, panel: any) {

    try {

        const url = 'http://127.0.0.1:11434/api/chat';

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

        const url = 'http://127.0.0.1:11434/api/chat';

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
