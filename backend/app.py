from flask import Flask, request, jsonify, Response
# import json
import sys

TESTING_MODE = '--test' in sys.argv

app = Flask(__name__)

model_initialized = False
lm_spell = None

@app.route('/init', methods=['POST'])
def init():

    data = request.get_json()
    language = data.get('language', 'sinhala')
    model = data.get('model', 'gemma-2-9b')

    global model_initialized, lm_spell

    if TESTING_MODE:
        from LmSpellMock import LmSpellMock

        lm_spell = LmSpellMock()
        model_initialized = True

        return jsonify({
            'status': 'initialized in testing mode',
            'language': language,
            'model': model
        })
    
    from LmSpell import LmSpell

    lm_spell = LmSpell(language=language, model_label=model)
    model_initialized = True

    return jsonify({'status': 'initialized'})

@app.route('/correct', methods=['POST'])
def correct():

    if not model_initialized:
        return jsonify({'error': 'Model not initialized'}), 400
    
    data = request.get_json()
    text = data.get('text', '')
    
    global lm_spell
    corrected_text = lm_spell.correct(text)

    return jsonify({'corrected': corrected_text})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8000)