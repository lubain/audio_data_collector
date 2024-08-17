import React, { useEffect, useRef } from 'react';

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const sourceRef = useRef(null);
  // const [isMicActive, setIsMicActive] = useState(true);

  const initializeAudio = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    bufferLengthRef.current = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);
      draw();
    });

    const draw = () => {
      requestAnimationFrame(draw);

      // if (!isMicActive) {
      //   canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      //   canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      //   return;
      // }

      analyser.getByteTimeDomainData(dataArrayRef.current);

      canvasCtx.fillStyle = "#fff";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#494949";

      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLengthRef.current;
      let x = 0;

      for (let i = 0; i < bufferLengthRef.current; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
  };

  useEffect(() => {
    initializeAudio();

    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} width="600" height="400" />
    </>
  );
};

export default AudioVisualizer;