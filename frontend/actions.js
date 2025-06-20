const APP_URL = 'https://cleanly-subtle-rabbit.ngrok-free.app';
const HF_SPACE_URL = 'https://nadil-k-lm-spell.hf.space/gradio_api/call/predict';

export async function init(language, model) {
    const url = `${APP_URL}/init`;
    const payload = { language, model };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

// export async function correct(text) {
//     const url = `${APP_URL}/correct`;
//     const payload = { text };

//     const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//         throw new Error(response.statusText);
//     }

//     return await response.json();
// }


export async function correct(text) {
    // Request 1[POST]: initiate the connection and get event_id
    const postResponse = await fetch(HF_SPACE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [text] }),
    });

    const { event_id } = await postResponse.json();
    if (!event_id) throw new Error('No event_id returned');

    // Request 2[GET]: stream the response using event_id
    const streamResponse = await fetch(`${HF_SPACE_URL}/${event_id}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'text/event-stream'
        }
    });

    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';
    let eventType = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            reader.releaseLock();
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ') && eventType === 'complete') {
                return JSON.parse(line.slice(6).trim())[0];
            }
        }
    }

    throw new Error('No complete event received');
}
