'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { analyzeMetric, chatWithExpert } from '@/services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricName: string;
  metricValue: number | string;
  iotData: {
    temperature?: number;
    moisture?: number;
    pH?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    humidity?: number;
    salt?: number;
    airTemp?: number;
  };
  cropInfo?: {
    cropName: string;
    plantedDate: string;
    harvestDate?: string;
    daysPlanted?: number;
  };
}

export default function AIChatModal({
  isOpen,
  onClose,
  metricName,
  metricValue,
  iotData,
  cropInfo
}: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialAnalysis, setInitialAnalysis] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial analysis when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadInitialAnalysis();
    }
  }, [isOpen]);

  const loadInitialAnalysis = async () => {
    setIsLoading(true);
    try {
      const analysis = await analyzeMetric(metricName, metricValue, iotData, cropInfo);
      setInitialAnalysis(analysis);
      setMessages([
        {
          role: 'assistant',
          content: analysis,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error loading analysis:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'Xin lỗi, tôi không thể phân tích chỉ số này lúc này. Vui lòng thử lại sau.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build chat history, excluding the initial analysis (first message from assistant)
      const chatHistory = messages
        .slice(1) // Skip the first message (initial analysis)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.content }]
        }));

      const response = await chatWithExpert(inputMessage, iotData, cropInfo, chatHistory);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp vấn đề khi trả lời. Vui lòng thử lại.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0f0e17] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Chuyên gia AI
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                Phân tích: <span className="font-semibold text-violet-600 dark:text-violet-400">{metricName}</span> = {metricValue}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center justify-center shadow-lg border-2 border-gray-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500 relative z-10 group"
            aria-label="Đóng"
          >
            <span className="text-2xl font-normal text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-200 group-hover:rotate-90 inline-flex items-center justify-center w-full h-full">
              ×
            </span>
          </button>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-[#1a1625]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md px-4 py-3'
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 shadow-md px-4 py-3'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      components={{
                        // Paragraphs - chat style
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-3 text-gray-700 dark:text-gray-300" {...props} />,
                        
                        // Strong/Bold - highlight important info
                        strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
                        
                        // Em/Italic
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-xs mt-2 text-violet-200">
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-[#0f0e17]">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi chuyên gia về cây trồng của bạn..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Gửi
            </button>
          </div>
          
          {cropInfo && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đang theo dõi: <span className="font-semibold text-violet-600 dark:text-violet-400">{cropInfo.cropName}</span> ({cropInfo.daysPlanted || 0} ngày)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

