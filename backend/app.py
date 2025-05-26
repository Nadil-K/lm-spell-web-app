from flask import Flask, request, jsonify
from LmSpell import LmSpell

# Web server to handle models

app = Flask(__name__)

# Dummy model state
model_initialized = False
lm_spell = None

@app.route('/init', methods=['POST'])
def init():
    data = request.get_json()
    language = data.get('language', 'sinhala')
    model = data.get('model', 'gemma-2-9b')

    global model_initialized, lm_spell

    lm_spell = LmSpell()
    model_initialized = True
    return jsonify({'status': 'initialized'})

@app.route('/correct', methods=['POST'])
def correct_text():

    if not model_initialized:
        return jsonify({'error': 'Model not initialized'}), 400
    
    data = request.get_json()
    text = data.get('text', '')
    

    # Dummy correction logic
    corrected_text = text  # Replace with actual correction logic
    return jsonify({'corrected': corrected_text})

if __name__ == '__main__':
    app.run(debug=True, port=8000)