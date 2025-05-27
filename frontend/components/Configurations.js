import { init } from '../actions.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('config-form');
    const languageSelect = document.getElementById('language');
    const modelSelect = document.getElementById('model');
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = false;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const language = languageSelect.value;
        const model = modelSelect.value;

        submitButton.disabled = true;

        const spinner = document.createElement('span');
        spinner.classList.add('spinner');
        submitButton.appendChild(spinner);

        try {
            await init(language, model);
        } catch (error) {
            console.error('Failed to initialize:', error);
        } finally {
            spinner.remove();
        }
    });

    function enableSubmit() {
        if (submitButton.disabled) {
            submitButton.disabled = false;
        }
    }

    languageSelect.addEventListener('change', enableSubmit);
    modelSelect.addEventListener('change', enableSubmit);
});
