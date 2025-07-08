import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Send, Mic, Volume2, VolumeX, Sun, Moon, Globe } from 'lucide-react';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import VoiceInput from './VoiceInput';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  audioUrl?: string;
  isLoading?: boolean;
}

interface ChatBotProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ theme, onThemeToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (sender: 'user' | 'bot', content: string, audioUrl?: string, isLoading = false): string => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender,
      content,
      audioUrl,
      isLoading
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    addMessage('user', text);
    const loadingId = addMessage('bot', 'Thinking...', undefined, true);

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ question: text })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      removeMessage(loadingId);
      
      if (data.answer && data.answer.trim()) {
        addMessage('bot', data.answer.trim(), data.audio_url);
      } else {
        addMessage('bot', 'No answer returned from the server.');
      }
    } catch (error) {
      removeMessage(loadingId);
      
      let errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addMessage('bot', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceTranscription = (transcription: string) => {
    if (transcription.trim()) {
      handleSendMessage(transcription);
    }
  };

  const handleAutoPlayToggle = () => {
    if (!isProcessing) {
      setAutoPlay(prev => !prev);
    }
  };

  const inputsDisabled = isProcessing || isRecording;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Streamlined Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rahi.ai</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maharashtra Travel Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector disabled={isProcessing} />
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
          {/* Messages Area */}
          <div 
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to Rahi.ai
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ask me about Maharashtra's destinations, culture, festivals, or travel tips to get started.
                  </p>
                </div>
              </div>
            ) : (
              messages.map(message => (
                <ChatMessage 
                  key={message.id}
                  message={message}
                  autoPlay={autoPlay}
                />
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <MessageInput 
                onSendMessage={handleSendMessage} 
                disabled={inputsDisabled}
              />
              <VoiceInput 
                isRecording={isRecording}
                onRecordingChange={setIsRecording}
                onTranscription={handleVoiceTranscription}
                disabled={isProcessing}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleAutoPlayToggle}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  autoPlay 
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                } disabled:opacity-50`}
              >
                {autoPlay ? <Volume2 size={16} /> : <VolumeX size={16} />}
                Auto-play responses
              </button>
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatBot;