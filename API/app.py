from flask import Flask, request, jsonify
import whisper
import os
import tempfile
from deep_translator import GoogleTranslator

app = Flask(__name__)
model = whisper.load_model("base")

@app.route('/translate', methods=['POST'])
def translate():
    lang_from = request.headers.get('from', 'auto')
    lang_to = request.headers.get('to', 'en')      

    # Guardar el archivo temporal
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(request.data)
        tmp_path = tmp.name

    try:
        # Transcripción
        result = model.transcribe(tmp_path, language=lang_from if lang_from != "auto" else None)
        original_text = result["text"]
        translated_text = GoogleTranslator(source=lang_from, target=lang_to).translate(original_text)

        print(f"Origen: {lang_from} → Destino: {lang_to}")
        print(f"Texto original: {original_text}")
        print(f"Traducción: {translated_text}")

        os.remove(tmp_path)
        return jsonify({ "translated": translated_text })

    except Exception as e:
        print("Error al transcribir o traducir:", e)
        os.remove(tmp_path)
        return jsonify({ "translated": "" })

if __name__ == '__main__':
    app.run(port=5000)
