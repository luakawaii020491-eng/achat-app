import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Bot,
  MessageSquare,
  BookOpen,
  Package,
  HelpCircle,
  Settings2,
  CheckCircle2,
  Send,
  Loader2,
  User,
} from 'lucide-react';

interface AIAssistantPanelProps {
  onOpenTraining: () => void;
}

interface ChatMsg {
  role: 'user' | 'ai';
  text: string;
}

const TRAINING_STEPS = [
  { id: 1, title: 'Nhận diện nhu cầu', desc: 'Hỏi size, tư vấn, hỏi màu', done: true },
  { id: 2, title: 'Gợi ý sản phẩm phù hợp', desc: 'Theo size/màu khách chọn', done: true },
  { id: 3, title: 'Thu thập thông tin', desc: 'Tên, SĐT, địa chỉ', done: true },
  { id: 4, title: 'Lên đơn', desc: 'Tạo đơn, tính phí ship', done: true },
  { id: 5, title: 'CSKH sau bán', desc: 'Gửi mã vận đơn, theo dõi', done: true },
];

const TRAINING_SUGGESTIONS = [
  'Dạy AI cách chào khách mới',
  'Dạy AI xử lý khi khách hỏi giá',
  'Dạy AI cách xin SĐT/địa chỉ',
];

export default function AIAssistantPanel({ onOpenTraining }: AIAssistantPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'muse' | 'chatgpt'>('muse');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: 'Chào bạn! Tôi là AI trợ lý của cửa hàng. Bạn có thể dạy tôi cách trả lời khách, ví dụ: "khi khách hỏi giá thì trả lời thế nào". Hãy thử chat với tôi nhé!' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showChat]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setSending(true);
    try {
      const res = await fetch('/api/ai/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
          context: 'Người dùng đang HUẤN LUYỆN AI bán hàng trong panel "AI trợ lý của cửa hàng". Hãy trả lời như một AI đang được dạy: xác nhận đã hiểu quy tắc mới, nhắc lại quy tắc ngắn gọn, và gợi ý cách áp dụng. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.',
        }),
      });
      const data = await res.json();
      const reply = data.reply || data.message || 'Tôi đã ghi nhận. Bạn có thể dạy thêm quy tắc khác nhé!';
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Chưa kết nối được AI (thiếu API key). Bạn hãy thêm GEMINI_API_KEY trong phần Cài đặt để tôi trả lời được nhé!' }]);
    } finally {
      setSending(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-10 border-l border-[#E2E8F0] bg-white flex flex-col items-center py-3 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors"
          title="Mở panel AI trợ lý"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="mt-3 [writing-mode:vertical-lr] text-[10px] font-bold text-violet-600 uppercase tracking-wider">
          AI trợ lý
        </div>
        <Sparkles className="w-4 h-4 text-violet-500 mt-2" />
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-[#E2E8F0] bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-bold text-gray-800">AI trợ lý của cửa hàng</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-white text-gray-500 transition-colors"
          title="Thu gọn"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Engine selection */}
        <div className="p-3 border-b border-[#F1F5F9]">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedEngine('muse')}
              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                selectedEngine === 'muse'
                  ? 'border-violet-400 bg-violet-50 shadow-sm'
                  : 'border-gray-200 hover:border-violet-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                selectedEngine === 'muse' ? 'bg-violet-600' : 'bg-gray-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-xs font-bold text-gray-800">AI Muse</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">đề xuất</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Muse — Trợ lý bán hàng chuyên nghiệp. Hiểu ngữ cảnh, gợi ý lên đơn, CSKH.
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedEngine('chatgpt')}
              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                selectedEngine === 'chatgpt'
                  ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                  : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                selectedEngine === 'chatgpt' ? 'bg-emerald-600' : 'bg-gray-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-800">ChatGPT</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Sử dụng ChatGPT (GPT-4o). Trả lời thông minh, linh hoạt, có thể dạy kịch bản lên đơn.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Training steps */}
        <div className="p-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-xs font-bold text-gray-800">Huấn luyện (Dạy) cho AI</span>
          </div>
          <p className="text-[10px] text-gray-500 mb-2.5 leading-relaxed">
            Dạy AI cách trả lời, tư vấn và lên đơn theo quy trình của cửa hàng.
          </p>
          <div className="space-y-1.5">
            {TRAINING_STEPS.map(step => (
              <div key={step.id} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-gray-700">
                    Bước {step.id}: {step.title}
                  </div>
                  <div className="text-[10px] text-gray-400">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onOpenTraining}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-violet-300 text-violet-700 rounded-xl text-xs font-semibold hover:bg-violet-50 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Tùy chỉnh kịch bản & kiến thức
          </button>
        </div>

        {/* Training data */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Package className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-xs font-bold text-gray-800">Dữ liệu huấn luyện</span>
          </div>
          <div className="space-y-1">
            {[
              { icon: MessageSquare, label: 'Kịch bản trả lời', count: 12 },
              { icon: BookOpen, label: 'Mẫu lên đơn', count: 6 },
              { icon: Package, label: 'Sản phẩm & tồn kho', badge: 'đồng bộ' },
              { icon: HelpCircle, label: 'FAQ – Câu hỏi thường gặp', count: 24 },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <item.icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="flex-1 text-[11px] text-gray-700">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[10px] text-gray-400 font-medium">({item.count})</span>
                )}
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-3 h-3 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: nút mở chat huấn luyện */}
      <div className="px-3 py-2 border-t border-[#F1F5F9] bg-gray-50">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {showChat ? 'Đóng chat huấn luyện' : 'Chat huấn luyện AI'}
        </button>
      </div>

      {/* Cửa sổ chat huấn luyện AI */}
      {showChat && (
        <div className="border-t border-violet-200 bg-white flex flex-col" style={{ height: 320 }}>
          <div className="px-3 py-1.5 bg-violet-50 border-b border-violet-100 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[11px] font-bold text-violet-700">
              Chat với AI ({selectedEngine === 'muse' ? 'Muse' : 'ChatGPT'}) để huấn luyện
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-1.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-violet-600" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex gap-1.5 justify-start">
                <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3 h-3 text-violet-600 animate-spin" />
                </div>
                <div className="bg-gray-100 px-2.5 py-1.5 rounded-xl text-[11px] text-gray-500">AI đang trả lời...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {messages.length <= 1 && (
            <div className="px-2.5 pb-1 flex flex-wrap gap-1">
              {TRAINING_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-2 py-1 bg-violet-50 text-violet-700 rounded-full hover:bg-violet-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="p-2 border-t border-gray-100 flex gap-1.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Nhập quy tắc muốn dạy AI..."
              className="flex-1 text-[11px] px-2.5 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400"
              disabled={sending}
            />
            <button
              onClick={() => sendMessage()}
              disabled={sending || !input.trim()}
              className="p-1.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
