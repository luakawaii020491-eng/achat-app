import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'Cách thêm sản phẩm mới vào page?',
  'Một page bán nhiều sản phẩm thì quản lý sao?',
  'Cách kết nối fanpage Facebook?',
  'AI chốt đơn hoạt động thế nào?',
  'Cách đẩy đơn sang J&T/GHN?',
];

const HELP_SYSTEM_PROMPT = `Bạn là trợ lý hướng dẫn sử dụng app Achat - Quản lý chốt đơn & Bán hàng đa kênh.
Nhiệm vụ: hướng dẫn chủ shop sử dụng app bằng tiếng Việt, giọng thân thiện, ngắn gọn, đi thẳng vào thao tác cụ thể.

Kiến thức về app:
- Quản lý 3 shop dép: DÉP XINH (quai ngang, 49k/đôi, size 36-39), Dép Hana (sục khoét lỗ, 65k/đôi, size 36-40), Bé Đan (sục 3 phân, 49k/đôi, size 36-40). Mỗi shop có 3 màu Đen/Nâu/Kem.
- Mỗi fanpage có thể bán NHIỀU sản phẩm: vào Sản phẩm → thêm sản phẩm mới → gán vào fanpage tương ứng. Mỗi sản phẩm có SKU riêng (VD: XINH-QN-DEN-37).
- Kết nối fanpage: Cài đặt → Kết nối Facebook → nhập Page ID + Page Access Token → webhook tự nhận tin nhắn.
- AI chốt đơn: vào Huấn luyện AI → chọn sản phẩm → dạy kịch bản (bảng size, điểm bán, xử lý từ chối) → AI tự phân tích chat và trích SĐT/địa chỉ/màu/size.
- Đẩy vận chuyển: Đơn hàng → chọn đơn → Đẩy đơn → chọn hãng (J&T, GHN, GHTK...) → in tem.
- Đối soát COD: menu Đối soát COD để theo dõi tiền thu hộ.

Quy tắc: trả lời ngắn gọn (dưới 5 câu), liệt kê bước bằng số thứ tự khi hướng dẫn thao tác. Không bịa tính năng không có. Nếu câu hỏi ngoài phạm vi app, nói rõ và gợi ý hỏi trực tiếp.`;

export default function HelpAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Chào bạn! Mình là trợ lý hướng dẫn app Achat. Bạn cần giúp gì về quản lý sản phẩm, kết nối page, AI chốt đơn hay đẩy vận chuyển?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text.trim(),
          systemPrompt: HELP_SYSTEM_PROMPT,
          history: messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const replyText = data.replyText || 'Xin lỗi, mình chưa hiểu câu hỏi. Bạn thử hỏi lại theo cách khác nhé.';

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: 'Có lỗi kết nối. Bạn kiểm tra lại API key AI trong phần Huấn luyện AI nhé, hoặc hỏi trực tiếp qua chat với mình.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          title="Trợ lý hướng dẫn"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <div className="font-semibold text-sm">Trợ lý Achat</div>
                <div className="text-xs text-violet-200">Hướng dẫn sử dụng app</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1.5">Câu hỏi gợi ý:</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 bg-white border border-violet-200 text-violet-700 rounded-full hover:bg-violet-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi cách dùng app..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
