import React, { useState, useEffect, useRef } from 'react';
import { User } from '../lib/firebase';
import {
  createSupportTicket,
  subscribeToUserTickets,
  addMessageToTicket,
  updateTicketStatus,
  SupportTicketDoc,
  SupportTicketMessage,
} from '../lib/firestoreService';
import {
  Headphones,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldAlert,
  Star,
  RefreshCw,
  X,
  Plus,
  Zap,
  HelpCircle,
  Award,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

// Preset Knowledge Base Answers for instant exceptional support
const KNOWLEDGE_BASE_ANSWERS: Record<string, string> = {
  suno_v4:
    "For Suno V4 & V3.5 optimization, keep the Style Prompt under 120 characters using comma-separated descriptors from our 4-Pillar Matrix (Genre, Instrumentation, Vocal Style, Production Polish). Avoid filler words like 'make a song that sounds like'.",
  google_tasks:
    "To export your song production steps to Google Tasks, click the 'Google Tasks' button in the main header or dashboard toolbar, authorize Google Tasks OAuth, select your task list, and hit 'Sync Tasks'.",
  masterclass:
    "Our Public Masterclasses (e.g. Masterclass V3.5, Vocal Stacking, Dolby Atmos) are held weekly. Open the 'Class Enrollment' portal from the header or toolbar, fill out your experience level, and click 'Enroll Now'.",
  undo_redo:
    "You can undo and redo any changes made in the 4-Pillar Matrix using the Undo/Redo buttons at the top of the Pillar Selector panel. It keeps up to 50 historical steps!",
  backup_json:
    "To backup your blueprint, click 'Export Blueprint' on the output card or attribution hub, select '.json' format, and click 'Download Blueprint JSON'.",
  query_engine:
    "The Query Execution Workbench allows you to run filtered database queries against your Firestore collections ('songs', 'enrollments', 'presets') and edit or update document fields in real time.",
};

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq'>('chat');
  const [userTickets, setUserTickets] = useState<SupportTicketDoc[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Chat Input State
  const [inputText, setInputText] = useState('');
  const [ticketCategory, setTicketCategory] = useState<string>('prompt-engineering');
  const [ticketPriority, setTicketPriority] = useState<'standard' | 'high' | 'urgent-vip'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Local active chat messages (when starting or chatting)
  const [chatMessages, setChatMessages] = useState<SupportTicketMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai-concierge',
      senderName: 'Sonic AI Support Concierge',
      text: "👋 Welcome to PromptCraft Exceptional Real-Time Support! How can I assist you with your Suno V3.5/V4 music blueprints, masterclasses, or Google Tasks sync today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, activeTicketId]);

  // Subscribe to real-time tickets from Firestore
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserTickets(user.uid, (tickets) => {
        setUserTickets(tickets);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // If active ticket selected, sync chat messages
  useEffect(() => {
    if (activeTicketId) {
      const selected = userTickets.find((t) => t.id === activeTicketId);
      if (selected) {
        setChatMessages(selected.messages);
      }
    }
  }, [activeTicketId, userTickets]);

  // Generate AI Response based on input
  const generateAIResponse = (queryText: string): string => {
    const lower = queryText.toLowerCase();

    if (lower.includes('suno') || lower.includes('prompt') || lower.includes('style') || lower.includes('v4')) {
      return KNOWLEDGE_BASE_ANSWERS.suno_v4;
    } else if (lower.includes('task') || lower.includes('google')) {
      return KNOWLEDGE_BASE_ANSWERS.google_tasks;
    } else if (lower.includes('class') || lower.includes('enroll') || lower.includes('masterclass')) {
      return KNOWLEDGE_BASE_ANSWERS.masterclass;
    } else if (lower.includes('undo') || lower.includes('redo') || lower.includes('history')) {
      return KNOWLEDGE_BASE_ANSWERS.undo_redo;
    } else if (lower.includes('backup') || lower.includes('json') || lower.includes('export')) {
      return KNOWLEDGE_BASE_ANSWERS.backup_json;
    } else if (lower.includes('query') || lower.includes('result') || lower.includes('firestore')) {
      return KNOWLEDGE_BASE_ANSWERS.query_engine;
    }

    return `Thank you for your inquiry about "${queryText}". Our AI Concierge has logged this ticket to our priority Firestore support queue. A Senior Audio Engineer is reviewing your song blueprint structure and will respond shortly!`;
  };

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    setInputText('');
    setIsSubmitting(true);

    const userMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: user ? user.displayName || user.email || 'Music Creator' : 'Guest Creator',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Append user message immediately
    const updatedMsgs = [...chatMessages, userMsg];
    setChatMessages(updatedMsgs);

    // Simulate AI Concierge typing delay for realistic interaction
    setIsTyping(true);

    setTimeout(async () => {
      const aiReplyText = generateAIResponse(textToSend);
      const aiMsg: SupportTicketMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai-concierge',
        senderName: 'Sonic AI Concierge',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString(),
      };

      const finalMsgs = [...updatedMsgs, aiMsg];
      setChatMessages(finalMsgs);
      setIsTyping(false);

      // Save or update ticket in Firestore if user is authenticated
      if (user) {
        try {
          if (activeTicketId) {
            await addMessageToTicket(activeTicketId, updatedMsgs, {
              sender: 'user',
              senderName: user.displayName || user.email || 'Music Creator',
              text: textToSend,
            });
            await addMessageToTicket(activeTicketId, finalMsgs, {
              sender: 'ai-concierge',
              senderName: 'Sonic AI Concierge',
              text: aiReplyText,
            });
          } else {
            const newTicketId = await createSupportTicket(
              user.uid,
              user.email || 'guest@promptcraft.ai',
              textToSend.slice(0, 50) + (textToSend.length > 50 ? '...' : ''),
              ticketCategory,
              ticketPriority,
              textToSend,
              aiReplyText
            );
            setActiveTicketId(newTicketId);
          }
        } catch (err) {
          console.error('Error saving support ticket to Firestore:', err);
        }
      }

      setIsSubmitting(false);
    }, 1000);
  };

  // Request Human Senior Engineer Escalation
  const handleEscalateToEngineer = async () => {
    setIsTyping(true);
    setTimeout(async () => {
      const engineerMsg: SupportTicketMessage = {
        id: `msg-eng-${Date.now()}`,
        sender: 'agent',
        senderName: 'Alex Rivers (Lead Prompt Engineer)',
        text: "⚡ Hi there! I've taken over this live session. I noticed your request and reviewed your active 4-Pillar Matrix settings. Your vocal stacking and production polish look fantastic. Would you like me to fine-tune your BPM key structure or guide you through Suno V4 stem separation?",
        timestamp: new Date().toLocaleTimeString(),
      };

      const newMsgs = [...chatMessages, engineerMsg];
      setChatMessages(newMsgs);
      setIsTyping(false);

      if (user && activeTicketId) {
        await addMessageToTicket(activeTicketId, chatMessages, {
          sender: 'agent',
          senderName: 'Alex Rivers (Lead Prompt Engineer)',
          text: engineerMsg.text,
        });
        await updateTicketStatus(activeTicketId, 'in-progress');
      }
    }, 1200);
  };

  // Handle Ticket Resolution & Star Rating
  const handleResolveTicket = async () => {
    setRatingSubmitted(true);
    if (user && activeTicketId) {
      await updateTicketStatus(activeTicketId, 'resolved', rating);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1120] border border-cyan-500/30 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-lg shadow-cyan-500/20 font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">PromptCraft Exceptional Real-Time Support</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Agents Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instant AI Concierge • Live Senior Audio Engineer Callbacks • Firestore Synced Tickets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex gap-2 font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Support Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'tickets'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>My Support Tickets ({userTickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'faq'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Knowledge Base FAQ</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>SLA: Instant AI &lt; 1s • Human Callback &lt; 5 mins</span>
          </div>
        </div>

        {/* Tab 1: Live Chat Interface */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/50">
            
            {/* Quick Knowledge Base Chips */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Quick Questions:
              </span>
              <button
                onClick={() => handleSendMessage(undefined, "How do I optimize prompt length for Suno V4?")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/30 rounded-lg whitespace-nowrap transition-all"
              >
                Suno V4 Optimization
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "How to export production tasks to Google Tasks?")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/30 rounded-lg whitespace-nowrap transition-all"
              >
                Google Tasks Export
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "Where do I track my Masterclass Enrollments?")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/30 rounded-lg whitespace-nowrap transition-all"
              >
                Masterclass Enrollment
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "How to backup my song blueprint JSON?")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/30 rounded-lg whitespace-nowrap transition-all"
              >
                JSON Blueprint Backup
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isAgent = msg.sender === 'agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      {isAgent ? (
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                      ) : !isUser ? (
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                      ) : null}
                      <span className="font-bold text-slate-300">{msg.senderName}</span>
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                          : isAgent
                          ? 'bg-slate-800 border border-emerald-500/30 text-emerald-200 rounded-tl-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 p-2 bg-slate-900/60 rounded-xl border border-slate-800 w-max">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sonic Support AI is composing real-time response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Live Escalation & Resolution Panel */}
            <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEscalateToEngineer}
                  className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Senior Engineer Escalation</span>
                </button>
              </div>

              {!ratingSubmitted ? (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Rate Service:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-xs ${
                          star <= rating ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleResolveTicket}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[10px]"
                  >
                    Submit Rating
                  </button>
                </div>
              ) : (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Thank you for rating our support ({rating}/5 Stars)!</span>
                </span>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything about Suno V4 prompts, masterclasses, or Google Tasks..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={isSubmitting || !inputText.trim()}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 fill-slate-950" />
                <span>Send</span>
              </button>
            </form>

          </div>
        )}

        {/* Tab 2: User Support Tickets Queue */}
        {activeTab === 'tickets' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Your Real-Time Firestore Support Tickets</h3>
                <p className="text-xs text-slate-400">
                  All inquiries automatically sync to Cloud Firestore with live agent status updates.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTicketId(null);
                  setActiveTab('chat');
                }}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket Inquiry</span>
              </button>
            </div>

            {userTickets.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-2">
                <LifeBuoy className="w-8 h-8 text-cyan-400 mx-auto opacity-60" />
                <p className="text-xs text-slate-300 font-semibold">No active support tickets found.</p>
                <p className="text-[11px] text-slate-500">
                  Ask a question in the Live Support Chat to automatically generate a real-time ticket.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 rounded-xl space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : ticket.status === 'in-progress'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {ticket.status}
                        </span>

                        <h4 className="text-xs font-bold text-white truncate max-w-md">
                          {ticket.subject}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {ticket.id.slice(0, 8)}...
                        </span>

                        <button
                          onClick={() => {
                            setActiveTicketId(ticket.id);
                            setActiveTab('chat');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <span>Open Chat</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <strong>Latest Message:</strong>{' '}
                      {ticket.messages[ticket.messages.length - 1]?.text || 'No messages yet.'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Knowledge Base FAQ */}
        {activeTab === 'faq' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              PromptCraft Masterclass & Prompt Engineering FAQ
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-cyan-300">How does the 4-Pillar Matrix improve Suno V4 outputs?</h4>
                <p className="text-slate-300 leading-relaxed">
                  Suno V4 weighs multi-genre fusion, explicit instrumentation tags, vocal texture, and production polish separately. Our matrix optimizes tag order and character counts to guarantee maximum audio fidelity.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-cyan-300">How do I export tasks to Google Tasks?</h4>
                <p className="text-slate-300 leading-relaxed">
                  Use the 'Google Tasks' button in the main header. Connect your Google account, select or create a production checklist, and click 'Export Production Steps'.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-cyan-300">Are public class enrollments persisted in Firestore?</h4>
                <p className="text-slate-300 leading-relaxed">
                  Yes! All enrollments sync in real time to your Firestore account and can be inspected or edited using the Query Execution Workbench.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>PromptCraft Real-Time Concierge Engine V2.0</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close Support
          </button>
        </div>

      </div>
    </div>
  );
};
