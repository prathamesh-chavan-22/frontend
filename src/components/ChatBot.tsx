import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
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

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    
    addMessage('user', text);
    const loadingId = addMessage('bot', '', undefined, true);

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
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      removeMessage(loadingId);
      
      if (data.answer && data.answer.trim()) {
        addMessage('bot', data.answer.trim(), data.audio_url);
      } else {
        addMessage('bot', 'I apologize, but I couldn\'t generate a response. Please try again.');
      }
    } catch (error) {
      removeMessage(loadingId);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setError(errorMessage);
      addMessage('bot', 'I\'m having trouble connecting right now. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceTranscription = (transcription: string) => {
    if (transcription.trim()) {
      handleSendMessage(transcription);
    }
  };

  const inputsDisabled = isProcessing || isRecording;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Minimal Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Rahi.ai</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Maharashtra Travel Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector disabled={isProcessing} />
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></span>
              Connection issue: {error}
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
          {/* Messages Area */}
          <div 
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MapPin size={28} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to Rahi.ai
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
            <div className="flex items-end gap-3 mb-3">
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
            
            {/* Status Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    disabled={isProcessing}
                    className="w-3 h-3 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  Auto-play responses
                </label>
              </div>
              
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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