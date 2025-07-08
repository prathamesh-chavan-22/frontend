import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle, Volume2 } from 'lucide-react';

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
      <div className="flex justify-end animate-in slide-in-from-right duration-300">
        <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
            <div className="flex justify-end mt-2">
              <span className="text-xs opacity-75">{getTimestamp()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-in slide-in-from-left duration-300">
      <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
          {message.isLoading ? (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-gray-100 mb-2">
                {message.content}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimestamp()}
                </span>
                
                {message.audioUrl && (
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                      hasError 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading</span>
                      </>
                    ) : hasError ? (
                      <>
                        <AlertCircle size={12} />
                        <span>Error</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause size={12} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} />
                        <span>Play</span>
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