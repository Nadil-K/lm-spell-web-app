from flask import Flask, request, jsonify, Response
import json
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

    lm_spell = LmSpell(language=language, model_label=model)
    model_initialized = True
    return jsonify({'status': 'initialized'})

@app.route('/correct', methods=['POST'])
def correct_text():

    if not model_initialized:
        return jsonify({'error': 'Model not initialized'}), 400
    
    data = request.get_json()
    text = data.get('text', '')
    
    global lm_spell
    corrected_text = lm_spell.correct(text)
    
    return Response(
        json.dumps({'corrected': corrected_text}, ensure_ascii=False),
        content_type='application/json; charset=utf-8'
    )

if __name__ == '__main__':
    app.run(debug=True ,host="0.0.0.0", port=8000)