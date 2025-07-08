import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  onTranscription: (transcription: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  isRecording, 
  onRecordingChange, 
  onTranscription,
  disabled = false
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTranscription, setPendingTranscription] = useState('');

  const sendVoice = async () => {
    if (disabled || isTranscribing || showConfirmation) return;

    setIsTranscribing(true);

    try {
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.transcription && data.transcription.trim()) {
        setPendingTranscription(data.transcription.trim());
        setShowConfirmation(true);
      } else {
        console.warn('Empty transcription received');
      }
    } catch (error) {
      console.error('Voice transcription failed:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleConfirmTranscription = () => {
    if (pendingTranscription) {
      onTranscription(pendingTranscription);
      setShowConfirmation(false);
      setPendingTranscription('');
    }
  };

  const handleCancelTranscription = () => {
    setShowConfirmation(false);
    setPendingTranscription('');
  };

  const handleVoiceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && !isTranscribing && !showConfirmation) {
      sendVoice();
    }
  };

  const isButtonDisabled = disabled || isTranscribing || showConfirmation;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleVoiceClick}
        disabled={isButtonDisabled}
        className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm ${
          isTranscribing
            ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
            : isButtonDisabled
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
            : 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
        }`}
      >
        {isTranscribing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Mic size={20} />
        )}
      </button>

      {showConfirmation && (
        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-xs z-10">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Did you say:
          </p>
          <p className="text-sm text-gray-900 dark:text-gray-100 mb-3 italic">
            "{pendingTranscription}"
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmTranscription}
              className="flex-1 px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={handleCancelTranscription}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;