import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex gap-2 sm:gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Processing magic..." : "Ask about India's wonders..."}
          placeholder={disabled ? "Processing magic..." : "Ask about Maharashtra's wonders..."}
          disabled={disabled}
          className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:ring-2 sm:focus:ring-3 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
          style={{
            backgroundColor: disabled ? 'var(--border-color)' : 'transparent',
            border: '2px solid var(--border-color)',
            color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
            boxShadow: '0 4px 16px var(--shadow-color)',
            focusRingColor: 'var(--accent-primary)'
          }}
        />
        {!disabled && (
          <Sparkles 
            size={14} 
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-pulse opacity-50" 
          />
        )}
      </div>
      <button
        type="submit"
        disabled={!inputValue.trim() || disabled}
        className="px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1 sm:gap-2 lg:gap-3 font-bold hover:scale-105 active:scale-95 min-w-0 backdrop-blur-sm"
        style={{
          background: (inputValue.trim() && !disabled)
            ? `linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))` 
            : 'var(--border-color)',
          color: (inputValue.trim() && !disabled) ? 'white' : 'var(--text-secondary)',
          boxShadow: (inputValue.trim() && !disabled) ? '0 4px 16px var(--shadow-color)' : 'none'
        }}
      >
        <Send size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[20px] lg:h-[20px] drop-shadow-sm" />
        <span className="hidden sm:inline text-xs sm:text-sm lg:text-base">
          {disabled ? 'Wait...' : 'Send'}
        </span>
        {(inputValue.trim() && !disabled) && (
          <Sparkles size={12} className="sm:w-[14px] sm:h-[14px] animate-pulse" />
        )}
      </button>
    </form>
  );
};

export default MessageInput;