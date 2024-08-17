import React, { useState } from 'react';
import AudioVisualizer from './AudioVisualizer';
import AudioRecord from './AudioRecord';
import './App.css';

const App = () => {
  const [started, setStarted] = useState(false);

  const onReset = () => {
    setStarted(true);
  };

  const handleProcessError = (error) => {
    console.error('Une erreur s\'est produit :', error);
  };

  return (
    <div className="App">
      {!started && <div className='container'><button onClick={onReset}>
        Start
      </button></div>}
      {started && <AudioVisualizer onProcessError={handleProcessError} />}
      {started && <AudioRecord onProcessError={handleProcessError} />}
    </div>
  );
};

export default App;
