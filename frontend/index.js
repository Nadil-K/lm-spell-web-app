import { correct } from './actions.js';

document.addEventListener('DOMContentLoaded', () => {
    const correctButton = document.getElementById('correct');
    const inputTextarea = document.querySelector('.input-textarea');
    const outputTextarea = document.querySelector('.output-textarea');

    let lastInput = '';

    function updateButtonState() {
        const currentInput = inputTextarea.value.trim();
        if (currentInput === '' || currentInput === lastInput) {
            correctButton.disabled = true;
        } else {
            correctButton.disabled = false;
        }
    }

    updateButtonState();

    inputTextarea.addEventListener('input', updateButtonState);

    correctButton.addEventListener('click', async () => {
        const inputText = inputTextarea.value.trim();
        if (!inputText) {
            return;
        }

        correctButton.disabled = true;

        const spinner = document.createElement('span');
        spinner.classList.add('spinner');
        correctButton.appendChild(spinner);

        try {
            const corrected = await correct(inputText);
            outputTextarea.value = corrected;
            lastInput = inputText;
        } catch (error) {
            console.error('Failed to correct:', error);
        } finally {
            spinner.remove();
            updateButtonState();
        }
    });
});
