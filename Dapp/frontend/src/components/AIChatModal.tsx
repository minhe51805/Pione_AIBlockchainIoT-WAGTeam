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
  const [typingText, setTypingText] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoPromptCount, setAutoPromptCount] = useState(0); // Track number of auto-prompts sent
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPromptTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, typingText]);

  // Cleanup typing animation and auto-prompt timer on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (autoPromptTimerRef.current) {
        clearTimeout(autoPromptTimerRef.current);
      }
    };
  }, []);

  // Multi-tier auto-prompt system
  useEffect(() => {
    if (!isOpen || hasUserInteracted) return;
    
    // Schedule next auto-prompt based on count
    let delay = 0;
    
    if (autoPromptCount === 0 && messages.length === 1) {
      // First prompt: 30 seconds after initial analysis
      delay = 30000;
      console.log('⏰ Scheduling auto-prompt #1 in 30 seconds...');
    } else if (autoPromptCount === 1) {
      // Second prompt: 20 seconds after first prompt
      delay = 20000;
      console.log('⏰ Scheduling auto-prompt #2 in 20 seconds...');
    } else if (autoPromptCount === 2) {
      // Third prompt: 20 seconds after second prompt
      delay = 20000;
      console.log('⏰ Scheduling auto-prompt #3 in 20 seconds...');
    } else if (autoPromptCount === 3) {
      // After third prompt: close modal after 20 seconds
      delay = 20000;
      console.log('⏰ No response after 3 prompts. Closing modal in 20 seconds...');
    }
    
    if (delay > 0) {
      autoPromptTimerRef.current = setTimeout(() => {
        if (!hasUserInteracted) {
          if (autoPromptCount < 3) {
            console.log(`✅ Sending auto-prompt #${autoPromptCount + 1}`);
            sendAutoPrompt();
          } else {
            console.log('❌ No response after 3 prompts. Closing modal...');
            onClose(); // Auto-close modal
          }
        }
      }, delay);

      return () => {
        if (autoPromptTimerRef.current) {
          clearTimeout(autoPromptTimerRef.current);
        }
      };
    }
  }, [isOpen, messages.length, hasUserInteracted, autoPromptCount]);

  // Send automatic follow-up prompt
  const sendAutoPrompt = async () => {
    // Different prompts for each tier
    const tierPrompts = [
      // Tier 1: Gentle follow-up
      [
        'Bác có muốn cháu tư vấn về cây trồng phù hợp với đất này không?',
        'Bác có câu hỏi gì về chỉ số đất không ạ?',
        'Có gì cháu có thể tư vấn thêm cho bác không?'
      ],
      // Tier 2: More engaging
      [
        'Cháu thấy đất của bác khá tốt đó! Bác muốn biết nên trồng cây gì không?',
        'Bác có muốn cháu phân tích kỹ hơn về điều kiện đất không ạ?',
        'Cháu có thể tư vấn cách cải thiện đất cho bác, bác có cần không?'
      ],
      // Tier 3: Last attempt
      [
        'Nếu bác bận, cháu có thể tư vấn sau nhé! Hoặc bác có câu hỏi nhanh nào không?',
        'Bác còn muốn hỏi gì nữa không ạ? Không thì cháu đóng chat giúp bác nhé!',
        'Cháu sắp đóng chat đây, bác còn cần tư vấn gì cuối không ạ?'
      ]
    ];
    
    const currentTier = Math.min(autoPromptCount, 2);
    const prompts = tierPrompts[currentTier];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    setIsLoading(true);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    typeMessage(randomPrompt, () => {
      const autoMessage: Message = {
        role: 'assistant',
        content: randomPrompt,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoMessage]);
      setTypingText('');
      
      // Increment auto-prompt count for next tier
      setAutoPromptCount(prev => prev + 1);
    });
  };

  // Typewriter effect function
  const typeMessage = (text: string, callback: () => void) => {
    setIsTyping(true);
    setTypingText('');
    
    let currentIndex = 0;
    const typingSpeed = 15; // milliseconds per character (faster = lower number)
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setTypingText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setIsTyping(false);
        callback();
      }
    }, typingSpeed);
  };

  // Initial analysis when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadInitialAnalysis();
      setHasUserInteracted(false); // Reset interaction flag
      setAutoPromptCount(0); // Reset auto-prompt counter
    }
    
    // Reset when modal closes
    if (!isOpen) {
      setHasUserInteracted(false);
      setAutoPromptCount(0);
      if (autoPromptTimerRef.current) {
        clearTimeout(autoPromptTimerRef.current);
      }
    }
  }, [isOpen]);

  const loadInitialAnalysis = async () => {
    setIsLoading(true);
    try {
      const analysis = await analyzeMetric(metricName, metricValue, iotData, cropInfo);
      setInitialAnalysis(analysis);
      setIsLoading(false);
      
      // Use typewriter effect for the response
      typeMessage(analysis, () => {
      setMessages([
        {
          role: 'assistant',
          content: analysis,
          timestamp: new Date()
        }
      ]);
        setTypingText('');
      });
    } catch (error) {
      console.error('Error loading analysis:', error);
      setIsLoading(false);
      const errorMsg = 'Xin lỗi, tôi không thể phân tích chỉ số này lúc này. Vui lòng thử lại sau.';
      typeMessage(errorMsg, () => {
      setMessages([
        {
          role: 'assistant',
            content: errorMsg,
          timestamp: new Date()
        }
      ]);
        setTypingText('');
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isTyping) return;

    // Mark that user has interacted (cancel auto-prompt)
    setHasUserInteracted(true);
    setAutoPromptCount(0); // Reset counter when user sends message
    if (autoPromptTimerRef.current) {
      clearTimeout(autoPromptTimerRef.current);
    }

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
      setIsLoading(false);
      
      // Use typewriter effect for the response
      typeMessage(response, () => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
        setTypingText('');
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      const errorMsg = 'Xin lỗi, tôi gặp vấn đề khi trả lời. Vui lòng thử lại.';
      typeMessage(errorMsg, () => {
      const errorMessage: Message = {
        role: 'assistant',
          content: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
        setTypingText('');
      });
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
          
          {/* Typing indicator when loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Chuyên gia đang suy nghĩ
                  </div>
                  <div className="flex gap-1">
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Typewriter effect message */}
          {isTyping && typingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-xl bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 shadow-md px-4 py-3">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-3 text-gray-700 dark:text-gray-300" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                    }}
                  >
                    {typingText}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">đang gõ...</p>
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
              placeholder={isTyping ? "Chuyên gia đang trả lời..." : "Hỏi chuyên gia về cây trồng của bạn..."}
              disabled={isLoading || isTyping}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm disabled:opacity-60"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isTyping}
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

