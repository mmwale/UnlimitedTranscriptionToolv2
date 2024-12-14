import { default as React, useEffect, useRef, useState } from 'react';
import TranscriptionExport from './TranscriptionExport';

  // State variables
const TranscriptionInterface = () => {
  const [transcription, setTranscription] = useState([]);// Stores the transcribed text
  const [recognition, setRecognition] = useState(null);// Stores the SpeechRecognition instance
  const [isTranscribing, setIsTranscribing] = useState(false);// Tracks if transcription is active
  const [browserSupport, setBrowserSupport] = useState(true);// Checks if browser supports speech recognition
  const startTimeRef = useRef(null);

  // Function to format time as MM:SS
  const formatTime = (start) => {
    if (!start) return '00:00';
    const elapsed = (new Date() - start) / 1000; // Convert to seconds
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
  // Check for browser support of SpeechRecognition
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition || 
      window.mozSpeechRecognition || 
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserSupport(false);
      return;
    }
    // Create and configure SpeechRecognition instance
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;// Keep listening even if the user pauses
    recognitionInstance.interimResults = false;// Only return final results
    recognitionInstance.lang = 'en-US';// Set language to English (US)
    
    // Event handler for when recognition starts
    recognitionInstance.onstart = () => {
      console.log('Speech recognition started');
      startTimeRef.current = new Date();
    };
    
    // Event handler for recognition results
    recognitionInstance.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex][0].transcript;
      
      if (transcript) {
        const currentTime = formatTime(startTimeRef.current);
        setTranscription((prev) => [...prev, {
          timestamp: currentTime,
          text: transcript
        }]);
      }
    };
    // Event handler for recognition errors
    recognitionInstance.onerror = (event) => {
      console.error('Error during speech recognition:', event.error);
    };
    // Event handler for when recognition ends
    recognitionInstance.onend = () => {
      console.log('Speech recognition ended');
      if (isTranscribing) {
        try {
          recognitionInstance.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };
    // Store the recognition instance in state
    setRecognition(recognitionInstance);
    // Cleanup function to stop recognition when component unmounts
    return () => {
      recognitionInstance.stop();
    };
  }, [isTranscribing]);
  
  // Function to toggle transcription on/off
  const toggleRecognition = () => {
    if (recognition) {
      if (isTranscribing) {
        recognition.stop(); // Immediately stop the recognition
        setIsTranscribing(false);
      } else {
        recognition.start();
        setIsTranscribing(true);
      }
    }
  };

  // Function to clear the transcription
  const clearTranscription = () => {
    setTranscription([]);
    // Reset start time when clearing
    startTimeRef.current = null;
  };

  // Render a message if browser doesn't support speech recognition
  if (!browserSupport) {
    return (
      <div className="browser-support-message">
        <p>Sorry, your browser does not support speech recognition.</p>
        <p>Try using the latest version of Chrome, Edge, or Safari.</p>
      </div>
    );
  }
  // Main render of the transcription interface
  return (
    <div className="transcription-container">
      {/* Textarea to display the transcription */}
      <div className="transcription-content"> 
        {transcription.length === 0 ? ( 
          <p className="transcription-placeholder">Transcription will appear here...</p> ) : ( 
            transcription.map((entry, index) => ( 
            <div key={index} 
            className="transcription-entry"> 
            <span className="timestamp">{entry.timestamp}s</span> 
            <p className="transcription-text">{entry.text}</p> 
            </div> 
          )) 
          )} 
      </div>
      {/* Container for transcription control buttons */}
      <div className="transcription-button-container">
        {/* Button to start/stop transcription */}
        <button 
          onClick={toggleRecognition}
          className={`btn ${isTranscribing ? 'btn-stop-transcription' : 'btn-start-transcription'}`}
        > 
          {isTranscribing ? 'Stop Transcription' : 'Start Transcription'} 
        </button>
        {/* Button to clear the transcription */}
        <button 
          onClick={() => clearTranscription()}
          className="btn btn-clear-transcription"
        >
          Clear Transcription
        </button>
      </div>
      {/* Component for exporting and managing transcriptions */}
      <TranscriptionExport transcription={transcription.map((entry) => entry.text).join(' ')} />
    </div>
  );
};
// Export the TranscriptionInterface component as the default export
export default TranscriptionInterface;