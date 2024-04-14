import fetch, { Headers } from 'node-fetch';
import { system_context_json } from './context';
import { functions, laia_context, laia_consciousness_context } from '../laia/functions';
import { PerformanceNodeTiming } from 'perf_hooks';
import { execSync } from 'child_process';

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

export async function petition_ollama_laia(model: string, data: any, query: string, panel: any) {
    try {

        // ASK LAIA FIRST
        const url = 'http://147.83.113.192:30147/ollama/api/chat';

        var counter_laia = 0;

        var laia_messages = [
            { role: 'system', content: laia_context }
        ];

        data.forEach((entry: any) => {
            const user_message = { role: 'user', content: entry.user };
            const assistant_message = { role: 'assistant', content: entry.assistant };
            laia_messages.push(user_message, assistant_message);
        });

        laia_messages.push({ role: 'user', content: `${query}` });

        var response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                model: model,
                messages: laia_messages,
                stream: false
            })
        });

        var responseData = await response.json() as any;
        var laia_answer = responseData.message.content;
        data.push({ role: 'user', content: query }, { role: 'assistant', content: laia_answer })
        laia_messages.push({ role: 'assistant', content: laia_answer });

        while (laia_answer.toLowerCase().includes('no answer') && counter_laia < 5) {

            // START LOOP FOR ASKING LAIA CONSCIOUSNESS UNTIL ANSWER CONTAINS "ANSWER"

            var laia_consciousness_messages = [
                { role: 'system', content: laia_consciousness_context}
            ];
            data.forEach((entry: any) => {
                const user_message = { role: 'user', content: entry.user };
                const assistant_message = { role: 'assistant', content: entry.assistant };
                laia_consciousness_messages.push(user_message, assistant_message);
            });
            laia_consciousness_messages.push({ role: 'user', content: query });

            var laia_consciousness_answer = "";
            var counter = 0;

            while (!laia_consciousness_answer.includes("ANSWER") && counter < 10) {
                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify({
                        model: model,
                        messages: laia_consciousness_messages,
                        stream: false
                    })
                });
        
                const responseData = await response.json() as any;
                laia_consciousness_answer = responseData.message.content;
                panel.webview.postMessage({ command: 'laiaConsciousnessResponse', response: laia_consciousness_answer });

                laia_consciousness_messages.push({ role: 'assistant', content: laia_consciousness_answer });

                if (laia_consciousness_answer.includes('{') && laia_consciousness_answer.includes('}') && laia_consciousness_answer.includes('FUNCTIONS')) {

                    const functionInfo = extractFunctionInfo(laia_consciousness_answer);
                    const functionName = functionInfo.functionName;
                    const functionInput1 = functionInfo?.functionInput1;
                    const functionInput2 = functionInfo?.functionInput2;

                    const bashFunction = (functions as any)[functionName].code.replace("$1", functionInput1).replace("$2", functionInput2);

                    const bashResponse = execSync(bashFunction).toString()
                    var completeBashResponse = "The action was performed correctly";
                    if (bashResponse != "") {
                        completeBashResponse = 'The action was performed and the response is the following: ' + bashResponse;
                    }
                    laia_consciousness_messages.push({ role: 'user', content: completeBashResponse })
                    panel.webview.postMessage({ command: 'laiaSystemResponse', response: completeBashResponse });
                }
                counter = counter + 1;
            }
            laia_messages.push({ role: 'assistant', content: "CONSCIOUSNESS " + laia_consciousness_answer });
            
            console.log(laia_messages)
            response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({
                    model: model,
                    messages: laia_messages,
                    stream: false
                })
            });
    
            responseData = await response.json() as any;
            laia_answer = responseData.message.content;
            data.push({ role: 'user', content: "CONSCIOUSNESS " + laia_consciousness_answer }, { role: 'assistant', content: laia_answer })
            laia_messages.push({ role: 'assistant', content: laia_answer });
            console.log(laia_answer)
            counter_laia = counter_laia + 1;

        }

        return data;

    } catch (error) {
        console.error('Error:', error);
    }
}

function extractFunctionInfo(str: string): { functionName: string, functionInput1: string, functionInput2?: string } {
    const regex = /\{(.+?)\s(.+?)(?:\s(.+?))?\}/;
    const match = str.match(regex);
    
    if (match && match.length >= 3) {
        const functionName = match[1];
        const functionInput1 = match[2];
        const functionInput2 = match[3]; 
        return { functionName, functionInput1, functionInput2 };
    } else {
        return { functionName: "", functionInput1: "", functionInput2: undefined };
    }
}