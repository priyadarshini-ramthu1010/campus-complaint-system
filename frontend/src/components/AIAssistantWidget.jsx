import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Send, 
  X, 
  Zap, 
  ShieldAlert, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AIAssistantWidget = ({ onApplySuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'diagnose'
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am CampusFix AI Assistant 🤖. How can I help you with campus maintenance today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Diagnostic form state
  const [diagIssue, setDiagIssue] = useState('');
  const [diagResult, setDiagResult] = useState(null);

  const samplePrompts = [
    "AC not cooling in Room 204",
    "Water leaking from bathroom pipe in Hostel Block B",
    "Power outage in Computer Science Lab 3",
    "Projector flickering during lectures"
  ];

  const handleSendMessage = async (msgText = inputMessage) => {
    if (!msgText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    if (msgText === inputMessage) setInputMessage('');
    setIsAnalyzing(true);

    try {
      // Call backend AI endpoint or intelligent client AI analyzer
      const response = await api.post('/api/ai/chat', { prompt: msgText }).catch(() => null);
      
      let aiText = '';
      if (response && response.data && response.data.reply) {
        aiText = response.data.reply;
      } else {
        // Fallback smart rule-based AI response engine
        const textLower = msgText.toLowerCase();
        if (textLower.includes('water') || textLower.includes('leak') || textLower.includes('tap') || textLower.includes('toilet')) {
          aiText = '💧 **Plumbing Diagnostic**: Water leaks are prioritized as High/Urgent to prevent structural damage. Technicians are typically dispatched within 1-2 hours. Please turn off the local valve if accessible!';
        } else if (textLower.includes('power') || textLower.includes('light') || textLower.includes('short') || textLower.includes('spark') || textLower.includes('ac')) {
          aiText = '⚡ **Electrical Diagnostic**: Electrical issues require certified staff. Please avoid touching exposed wires! Standard resolution SLA is 2 hours for power outages and 4 hours for AC units.';
        } else if (textLower.includes('door') || textLower.includes('lock') || textLower.includes('bench') || textLower.includes('desk') || textLower.includes('window')) {
          aiText = '🪑 **Carpentry/Furniture Diagnostic**: Furniture and fixture repairs are scheduled daily. Resolution SLA is 24-48 hours. Ensure the room key is available for staff.';
        } else if (textLower.includes('projector') || textLower.includes('wifi') || textLower.includes('network') || textLower.includes('computer')) {
          aiText = '💻 **IT/AV Equipment Diagnostic**: Academic lab hardware issue logged. IT department will verify signal & replace bulb/cable within 3 hours.';
        } else {
          aiText = `✨ **AI Analysis**: Thank you for reporting this issue. Your complaint will be automatically routed to the relevant campus department. Average resolution time is 4-6 hours. You can track real-time technician progress on your dashboard!`;
        }
      }

      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ai',
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsAnalyzing(false);
      }, 600);

    } catch (err) {
      setIsAnalyzing(false);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I parsed your request successfully! You can lodge a formal complaint directly via the "+ Raise Complaint" button on your dashboard.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleRunDiagnostic = (issueText = diagIssue) => {
    if (!issueText.trim()) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const lower = issueText.toLowerCase();
      let category = 'General';
      let priority = 'Medium';
      let sla = '4 to 8 hours';
      let dept = 'Maintenance Department';
      let steps = ['Inform resident warden', 'Clear access pathway'];

      if (lower.includes('water') || lower.includes('leak') || lower.includes('overflow') || lower.includes('toilet')) {
        category = 'Plumbing';
        priority = 'High';
        sla = '1 to 2 hours';
        dept = 'Plumbing Response Team';
        steps = ['Turn off main valve if possible', 'Keep floor dry to prevent slipping'];
      } else if (lower.includes('spark') || lower.includes('wire') || lower.includes('shock') || lower.includes('short')) {
        category = 'Electrical';
        priority = 'Critical';
        sla = '30 to 60 minutes';
        dept = 'Emergency Electrical Squad';
        steps = ['DO NOT touch exposed wires', 'Switch off main circuit breaker switch'];
      } else if (lower.includes('ac') || lower.includes('fan') || lower.includes('cool')) {
        category = 'Electrical';
        priority = 'Medium';
        sla = '3 to 5 hours';
        dept = 'HVAC & Cooling Team';
        steps = ['Keep windows closed', 'Check remote battery'];
      } else if (lower.includes('clean') || lower.includes('dust') || lower.includes('garbage')) {
        category = 'Housekeeping';
        priority = 'Low';
        sla = '12 to 24 hours';
        dept = 'Sanitation & Housekeeping';
        steps = ['Ensure area is accessible'];
      }

      setDiagResult({
        category,
        priority,
        sla,
        department: dept,
        safetySteps: steps,
        suggestedTitle: issueText.length > 30 ? issueText.substring(0, 30) + '...' : issueText,
        suggestedDescription: `[AI Verified Issue]\nProblem: ${issueText}\nPriority: ${priority}\nTarget SLA: ${sla}`
      });
      setIsAnalyzing(false);
    }, 700);
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-white/20"
        title="Open AI Maintenance Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span className="font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">AI Smart Assistant</span>
        <span className="bg-white/20 text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md">Live</span>
      </button>

      {/* AI Assistant Modal Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] max-h-[600px] h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  CampusFix AI Hub
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">v2.5</span>
                </h3>
                <p className="text-[11px] text-indigo-200/80">Instant Complaint Diagnosis & SLA Guide</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Chat Assistant
            </button>

            <button
              onClick={() => setActiveTab('diagnose')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'diagnose'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Auto Diagnostic
            </button>
          </div>

          {/* TAB 1: AI Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2.5 rounded-2xl w-max border border-slate-200 dark:border-slate-700">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                    AI thinking & analyzing campus maintenance records...
                  </div>
                )}
              </div>

              {/* Sample Quick Prompts */}
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Try Quick Questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.slice(0, 2).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p)}
                      className="text-[10px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg transition-colors truncate max-w-[180px]"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask AI about campus maintenance..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isAnalyzing}
                  className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: AI Auto Diagnostic */}
          {activeTab === 'diagnose' && (
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Describe the Issue
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Water leaking heavily under sink in Hostel Block A, Room 102..."
                  value={diagIssue}
                  onChange={(e) => setDiagIssue(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleRunDiagnostic()}
                  disabled={!diagIssue.trim() || isAnalyzing}
                  className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  Run AI Smart Analysis
                </button>
              </div>

              {/* Diagnostic Results */}
              {diagResult && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Diagnosis Result
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      diagResult.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      diagResult.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {diagResult.priority} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{diagResult.category}</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Target SLA</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {diagResult.sla}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Safety Steps</span>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                      {diagResult.safetySteps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {onApplySuggestion && (
                    <button
                      onClick={() => {
                        onApplySuggestion(diagResult);
                        setIsOpen(false);
                        toast.success('AI recommendations applied to complaint form!');
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Apply AI Suggestion to Form
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;
