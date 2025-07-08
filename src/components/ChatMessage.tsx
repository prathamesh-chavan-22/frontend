import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  audioUrl?: string;
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
  autoPlay: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, autoPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (message.audioUrl && autoPlay && message.sender === 'bot' && !message.isLoading) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [message.audioUrl, autoPlay, message.sender, message.isLoading]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    if (!message.audioUrl) return;

    try {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      if (!audioRef.current) {
        audioRef.current = new Audio();
        
        audioRef.current.oncanplay = () => setIsLoading(false);
        audioRef.current.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        audioRef.current.onpause = () => setIsPlaying(false);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setHasError(true);
          setIsPlaying(false);
          setIsLoading(false);
        };
      }

      if (audioRef.current.src !== message.audioUrl) {
        audioRef.current.src = message.audioUrl;
      }

      await audioRef.current.play();
    } catch (error) {
      setHasError(true);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs sm:max-w-md lg:max-w-lg">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm">
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
            <div className="flex justify-end mt-1">
              <span className="text-xs opacity-75">{getTimestamp()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
          {message.isLoading ? (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Thinking...</span>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-gray-100">
                {message.content}
              </p>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimestamp()}
                </span>
                
                {message.audioUrl && (
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    disabled={isLoading}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                      hasError 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                    } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                        Loading
                      </>
                    ) : hasError ? (
                      <>
                        <AlertCircle size={12} />
                        Error
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause size={12} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        Play
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;