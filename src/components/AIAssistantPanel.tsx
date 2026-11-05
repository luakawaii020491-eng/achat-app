import React, { useState } from 'react';
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
} from 'lucide-react';

interface AIAssistantPanelProps {
  onOpenTraining: () => void;
}

const TRAINING_STEPS = [
  { id: 1, title: 'Nhận diện nhu cầu', desc: 'Hỏi size, tư vấn, hỏi màu', done: true },
  { id: 2, title: 'Gợi ý sản phẩm phù hợp', desc: 'Theo size/màu khách chọn', done: true },
  { id: 3, title: 'Thu thập thông tin', desc: 'Tên, SĐT, địa chỉ', done: true },
  { id: 4, title: 'Lên đơn', desc: 'Tạo đơn, tính phí ship', done: true },
  { id: 5, title: 'CSKH sau bán', desc: 'Gửi mã vận đơn, theo dõi', done: true },
];

export default function AIAssistantPanel({ onOpenTraining }: AIAssistantPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'muse' | 'chatgpt'>('muse');

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

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-[#F1F5F9] bg-gray-50">
        <p className="text-[9px] text-gray-400 text-center leading-relaxed">
          Chat với AI ở ô chat bên dưới để dạy thêm<br />kịch bản mới cho cửa hàng
        </p>
      </div>
    </div>
  );
}
