import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Language, PatientProfile, Medication, SymptomAssessment } from '../types';

interface AiCompanionProps {
  currentLang: Language;
  patient: PatientProfile;
  medications: Medication[];
  symptomHistory: SymptomAssessment[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiCompanion: React.FC<AiCompanionProps> = ({
  currentLang,
  patient,
  medications,
  symptomHistory,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: currentLang === 'ar'
        ? `أهلاً بك يا ${patient.name}. أنا مساعد الذكاء الاصطناعي لرحلة تعافيك في +CareBridge. كيف يمكنني مساعدتك اليوم بخصوص خطة خروجك من المستشفى، الأدوية، أو الأعراض؟`
        : `Welcome back, ${patient.name}. I am your +CareBridge Recovery AI Companion. How can I help you today regarding your post-discharge roadmap, medications, or recovery questions?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/patient-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          patientProfile: patient,
          medications,
          symptomHistory,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: currentLang === 'ar'
            ? 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'Sorry, I encountered an error connecting to your AI companion. Please try again shortly.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = currentLang === 'ar' ? [
    'ما هي القيود الغذائية في رحلة تعافي اليوم؟',
    'كيف أعرف إذا كان جرح العملية طبيعياً؟',
    'ما هي أوقات أخذ أدويتي القادمة؟',
    'متى يجب علي الاتصال بالطوارئ؟',
  ] : [
    'What are my dietary restrictions for recovery today?',
    'How do I know if my surgical incision is healing normally?',
    'What are my scheduled medication times?',
    'When should I call emergency services?',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-180px)] max-h-[800px] animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600/80 border border-teal-400/40 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-teal-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black">+CareBridge AI Health Companion</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/30 border border-teal-400/40 text-[10px] font-extrabold text-teal-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-teal-200 font-medium">
              {currentLang === 'ar'
                ? 'مساعدك الطبي الذكي للإجابة عن أسئلة التعافي ومتابعة خطة الخروج'
                : 'Your personalized clinical assistant for post-operative recovery guidance'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-teal-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Clinical Context Loaded</span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-xs ${
                  isAssistant
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isAssistant
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    : 'bg-teal-600 text-white rounded-tr-xs font-medium'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></div>
              <span className="font-semibold">AI is analyzing your recovery journey...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Suggested:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputMessage(prompt)}
            className="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition shrink-0 border border-teal-200/60"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          placeholder={
            currentLang === 'ar'
              ? 'اسأل مساعد التعافي الذكي عن أدويتك أو رحلتك...'
              : 'Ask your AI recovery companion about your journey, medications, or care...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 p-3.5 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-5 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-black rounded-2xl transition flex items-center gap-2 text-xs sm:text-sm shadow-xs shrink-0"
        >
          <span>Send</span>
          <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </form>
    </div>
  );
};
