from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import wave
import os

app = Flask(__name__)
# CORS(app)  # Cette ligne permet à toutes les origines d'accéder à votre serveur Flask
CORS(app, resources={r"/recording": {"origins": "http://localhost:3000"}})  # Limite l'origine à localhost:3000

@app.route('/recording', methods=['POST'])
def recording():
    try:
        audio_data = request.json['audio_data']
        
        # Enregistrer les données audio en fichier WAV
        fileDir = "data/"
        # len_audio = getLengthFille(fileDir)
        
        save_wav_file(fileDir, audio_data)

        return jsonify({'recorded_text': "enregistrement reussit !"})
    except Exception as e:
        print("Erreur :", str(e))
        return jsonify({'error': str(e)}), 500

def getLengthFille(fileDir):
    isnone = True
    len_audio = 0
    for i,filename in enumerate(os.listdir(fileDir)):
        len_audio = i
        isnone = False
    if isnone:
        len_audio = len_audio + 1
    else:
        len_audio = len_audio + 2
    return len_audio

def save_wav_file(fileDir, audio_data):
    sample_rate = 16000  # Définissez le taux d'échantillonnage à ce qui est utilisé par votre modèle
    audio_data = np.array(audio_data, dtype=np.float32)

    # Obtenir la date et l'heure actuelles
    date_actuelle = datetime.now()

    # Convertir la date en secondes depuis l'époque (01/01/1970)
    secondes = (date_actuelle - datetime(2024, 1, 1)).total_seconds()

    secondes = str(secondes)
    secondes = secondes.replace(".", "_")
    filename = fileDir+secondes+".wav"
    
    # Normaliser les données audio pour correspondre au format WAV
    audio_data = (audio_data * 32767).astype(np.int16)
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)  # Mono audio
        wf.setsampwidth(2)  # 2 bytes per sample
        wf.setframerate(sample_rate)
        wf.writeframes(audio_data.tobytes())

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)