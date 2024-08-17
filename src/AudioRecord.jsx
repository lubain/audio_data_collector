import React, { useState, useRef } from 'react';
import axios from 'axios';
import Mic from "@mui/icons-material/Mic";
import MicOff from "@mui/icons-material/MicOff";

const AudioRecord = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());

  const handleStartRecording = () => {
    setTranscribedText('');
    setError('');
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();

        mediaRecorder.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          
          // Downsample to 16kHz if needed
          const sampleRate = 16000;
          const offlineAudioContext = new OfflineAudioContext(1, audioBuffer.duration * sampleRate, sampleRate);
          const bufferSource = offlineAudioContext.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.connect(offlineAudioContext.destination);
          bufferSource.start(0);
          
          const renderedBuffer = await offlineAudioContext.startRendering();
          const rawData = renderedBuffer.getChannelData(0); // Assume mono audio

          sendAudioData(rawData);
          audioChunksRef.current = [];
        };

        setIsRecording(true);
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        setError('Erreur d\'accès au microphone.');
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioData = async (audioData) => {
    try {
      const response = await axios.post('http://localhost:5000/recording', {
        audio_data: Array.from(audioData)
      });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setTranscribedText(response.data.recorded_text);
        setError('');  // Clear any previous errors
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError(`Erreur lors de l'enregistrement de l'audio: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  return (
    <div>
      <button onClick={isRecording ? handleStopRecording : handleStartRecording} className="action" >
      {isRecording ? (
        <>
          <Mic className="mic" />
        </>
      ) : (
        <>
          <MicOff className="mic" />
        </>
      )}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transcribedText && (
        <div>
          <p style={{ color: '#000' }}>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecord;
