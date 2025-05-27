function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function init(language, model) {
    await sleep(2000);
    console.log('LM Spell initialized', language, model);
}

export async function correct(text) {
    await sleep(2000);
    console.log('correct', text);
    return text;
}
