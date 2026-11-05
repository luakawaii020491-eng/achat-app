import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Copy,
  Sparkles,
  BookOpen,
  Send,
  Zap,
  Tag,
} from 'lucide-react';
import { QuickReplyTemplate, QuickReplyCategory } from '../types';

interface QuickReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickReplies: QuickReplyTemplate[];
  onAddQuickReply: (template: QuickReplyTemplate) => void;
  onUpdateQuickReply: (template: QuickReplyTemplate) => void;
  onDeleteQuickReply: (id: string) => void;
  onSelectToSend?: (content: string) => void;
}

export const QuickReplyModal: React.FC<QuickReplyModalProps> = ({
  isOpen,
  onClose,
  quickReplies,
  onAddQuickReply,
  onUpdateQuickReply,
  onDeleteQuickReply,
  onSelectToSend,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formShortcut, setFormShortcut] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<QuickReplyCategory>('chao_hoi');
  const [formContent, setFormContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'chao_hoi', label: 'Chào hỏi' },
    { id: 'xin_thong_tin', label: 'Xin SĐT & Đ/C' },
    { id: 'thanh_toan', label: 'Thanh toán / STK' },
    { id: 'van_chuyen', label: 'Vận chuyển / Ship' },
    { id: 'tu_van_size', label: 'Tư vấn Size / Màu' },
    { id: 'khuyen_mai', label: 'Khuyến mãi' },
    { id: 'khac', label: 'Khác' },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormShortcut('/');
    setFormTitle('');
    setFormCategory('chao_hoi');
    setFormContent('');
    setIsEditing(true);
  };

  const handleOpenEdit = (t: QuickReplyTemplate) => {
    setEditingId(t.id);
    setFormShortcut(t.shortcut);
    setFormTitle(t.title);
    setFormCategory(t.category);
    setFormContent(t.content);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    let shortcut = formShortcut.trim();
    if (shortcut && !shortcut.startsWith('/')) {
      shortcut = '/' + shortcut;
    }

    if (editingId) {
      onUpdateQuickReply({
        id: editingId,
        shortcut: shortcut || '/mau',
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        usageCount: quickReplies.find((q) => q.id === editingId)?.usageCount || 0,
      });
    } else {
      onAddQuickReply({
        id: `qr-${Date.now()}`,
        shortcut: shortcut || `/mau${quickReplies.length + 1}`,
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        usageCount: 0,
        shortcutKey: `${(quickReplies.length % 9) + 1}`,
      });
    }

    setIsEditing(false);
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    setFormContent((prev) => prev + placeholder);
  };

  const filteredReplies = quickReplies.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        t.title.toLowerCase().includes(q) ||
        t.shortcut.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0088FF] to-blue-700 text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Quản lý câu trả lời mẫu cho nhân viên tư vấn
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0088FF]">
                  {quickReplies.length} mẫu
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Nhân viên gõ phím tắt <kbd className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[10px] text-slate-800">/</kbd> hoặc <kbd className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[10px] text-slate-800">#</kbd> trong ô chat để gửi nhanh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 rounded-xl bg-[#0088FF] hover:bg-[#0077E6] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm câu trả lời mẫu</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          /* Form: Create or Edit Template */
          <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-[#0F172A]">
                {editingId ? 'Chỉnh sửa câu trả lời mẫu' : 'Tạo câu trả lời mẫu mới'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-[#64748B] hover:text-[#0F172A] font-semibold"
              >
                Hủy bỏ
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#334155]">
                  Phím tắt gõ nhanh (bắt đầu bằng /)
                </label>
                <input
                  type="text"
                  placeholder="/sdt, /stk, /size"
                  value={formShortcut}
                  onChange={(e) => setFormShortcut(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-mono font-bold text-[#0088FF] outline-none focus:border-[#0088FF] focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#334155]">
                  Tiêu đề gợi nhớ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xin SĐT & Địa chỉ"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#334155]">
                  Nhóm chủ đề
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as QuickReplyCategory)}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:bg-white cursor-pointer"
                >
                  <option value="chao_hoi">Chào hỏi</option>
                  <option value="xin_thong_tin">Xin SĐT &amp; Đ/C</option>
                  <option value="thanh_toan">Thanh toán / STK</option>
                  <option value="van_chuyen">Vận chuyển / Ship</option>
                  <option value="tu_van_size">Tư vấn Size / Màu</option>
                  <option value="khuyen_mai">Khuyến mãi / Voucher</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
            </div>

            {/* Quick Insert Placeholders */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#334155]">
                  Nội dung câu trả lời mẫu gửi khách
                </label>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <span className="font-semibold">Chèn nhanh biến số:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertPlaceholder('{ten_khach}')}
                    className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-700 hover:bg-blue-100 font-mono text-[10px] cursor-pointer"
                  >
                    {'{ten_khach}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertPlaceholder('{sdt}')}
                    className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 hover:bg-emerald-100 font-mono text-[10px] cursor-pointer"
                  >
                    {'{sdt}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertPlaceholder('{ten_shop}')}
                    className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-purple-700 hover:bg-purple-100 font-mono text-[10px] cursor-pointer"
                  >
                    {'{ten_shop}'}
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                placeholder="Nhập nội dung tin nhắn tư vấn gửi khách hàng..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:bg-white leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0088FF] hover:bg-[#0077E6] px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                {editingId ? 'Cập nhật câu trả lời' : 'Lưu câu trả lời mẫu'}
              </button>
            </div>
          </form>
        ) : (
          /* List & Search Mode */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="border-b border-[#E2E8F0] p-4 bg-white flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Tìm theo phím tắt (/sdt, /stk), tiêu đề hoặc nội dung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] pl-9 pr-4 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:bg-white"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-[#0088FF] text-white'
                        : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredReplies.length > 0 ? (
                filteredReplies.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-[#CBD5E1] p-3.5 bg-white hover:border-[#0088FF]/60 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-[#0088FF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          {t.shortcut}
                        </span>
                        <h4 className="font-bold text-xs text-[#0F172A]">
                          {t.title}
                        </h4>
                        <span className="text-[10px] text-[#94A3B8] bg-slate-100 px-2 py-0.5 rounded-full">
                          {categories.find((c) => c.id === t.category)?.label || t.category}
                        </span>
                        {t.usageCount !== undefined && t.usageCount > 0 && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            Đã dùng: {t.usageCount} lần
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#334155] whitespace-pre-line bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-100 leading-relaxed font-sans">
                        {t.content}
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col gap-1.5 shrink-0 justify-end">
                      {onSelectToSend && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectToSend(t.content);
                            onClose();
                          }}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
                          title="Gửi ngay vào ô chat"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Gửi vào chat</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyContent(t.content, t.id)}
                        className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs text-[#475569] hover:bg-slate-100 cursor-pointer"
                        title="Copy nội dung"
                      >
                        {copiedId === t.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] hover:text-[#0088FF] hover:bg-slate-100 cursor-pointer"
                          title="Chỉnh sửa câu trả lời mẫu"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteQuickReply(t.id)}
                          className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Xóa câu trả lời mẫu"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[#94A3B8] space-y-2">
                  <MessageSquare className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-xs">Không tìm thấy câu trả lời mẫu nào phù hợp.</p>
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="text-xs font-bold text-[#0088FF] hover:underline"
                  >
                    + Tạo câu trả lời mẫu ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0088FF]" />
            <span>Mẹo: Nhân viên chỉ cần gõ <strong>/</strong> trong ô chat để chọn nhanh câu trả lời mẫu.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#334155] hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
