import fetch from 'node-fetch';

export async function start_conversation(model: string, message: string) {
    try {

        const url = 'http://147.83.113.192:30147/laialogs/start_conversation';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                message: message
            })
        });

        const responseData = await response.json() as any;
        return responseData.conversation_id;

    } catch (error) {
        console.error('Error:', error);
    }
}

export async function continue_conversation(model: string, message: string, id: string) {
    try {

        const url = `http://147.83.113.192:30147/laialogs/continue_conversation/${id}`;

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                message: message
            })
        });

    } catch (error) {
        console.error('Error:', error);
    }
}
