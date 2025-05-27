const APP_URL = 'https://cleanly-subtle-rabbit.ngrok-free.app';

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

export async function correct(text) {
    const url = `${APP_URL}/correct`;
    const payload = { text };

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
