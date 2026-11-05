import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Check, Sparkles } from 'lucide-react';
import { HashtagLabel } from '../types';

interface HashtagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  hashtags: HashtagLabel[];
  onAddHashtag: (newTag: HashtagLabel) => void;
  onDeleteHashtag: (tagId: string) => void;
}

export const HashtagManagerModal: React.FC<HashtagManagerModalProps> = ({
  isOpen,
  onClose,
  hashtags,
  onAddHashtag,
  onDeleteHashtag,
}) => {
  if (!isOpen) return null;

  const [newTagName, setNewTagName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const COLOR_PALETTES = [
    { color: 'bg-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700', label: 'Tím' },
    { color: 'bg-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', label: 'Xanh lá' },
    { color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', label: 'Vàng cam' },
    { color: 'bg-sky-500', bgColor: 'bg-sky-50', textColor: 'text-sky-700', label: 'Xanh da trời' },
    { color: 'bg-pink-500', bgColor: 'bg-pink-50', textColor: 'text-pink-700', label: 'Hồng' },
    { color: 'bg-rose-600', bgColor: 'bg-rose-50', textColor: 'text-rose-700', label: 'Đỏ' },
    { color: 'bg-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', label: 'Chàm' },
    { color: 'bg-slate-600', bgColor: 'bg-slate-100', textColor: 'text-slate-700', label: 'Xám đậm' },
    { color: 'bg-teal-600', bgColor: 'bg-teal-50', textColor: 'text-teal-700', label: 'Xanh mòng két' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const chosen = COLOR_PALETTES[selectedColorIndex];
    const newTag: HashtagLabel = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: chosen.color,
      bgColor: chosen.bgColor,
      textColor: chosen.textColor,
    };

    onAddHashtag(newTag);
    setNewTagName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#0088FF]" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Quản lý nhãn / Hashtag Achat Social
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-[#64748B] hover:bg-[#E2E8F0]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* Create New Tag Box */}
          <form onSubmit={handleCreate} className="rounded-xl border border-[#CBD5E1] p-3.5 bg-[#F8FAFC] space-y-3">
            <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
              Thêm nhãn hội thoại mới
            </span>

            <div>
              <label className="font-semibold text-[#475569] block mb-1">Tên nhãn / Hashtag</label>
              <input
                type="text"
                placeholder="Ví dụ: ĐÃ CỌC, CẦN GỌI LẠI, HẸN CHIỀU GIAO..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#475569] block mb-1">Chọn màu sắc nhãn</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTES.map((palette, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform ${palette.color} ${
                      selectedColorIndex === idx ? 'ring-2 ring-offset-2 ring-[#0088FF] scale-110' : ''
                    }`}
                    title={palette.label}
                  >
                    {selectedColorIndex === idx && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {newTagName.trim() && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#64748B]">Xem trước:</span>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${COLOR_PALETTES[selectedColorIndex].bgColor} ${COLOR_PALETTES[selectedColorIndex].textColor} border border-current`}
                >
                  <span className={`h-2 w-2 rounded-full ${COLOR_PALETTES[selectedColorIndex].color}`} />
                  <span>{newTagName}</span>
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0088FF] py-2 text-xs font-bold text-white hover:bg-[#0077E6] transition-colors"
            >
              + Tạo nhãn mới
            </button>
          </form>

          {/* Existing Hashtags List */}
          <div className="space-y-2">
            <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] block">
              Danh sách nhãn hiện có ({hashtags.length})
            </span>

            <div className="divide-y divide-[#F1F5F9] border rounded-xl border-[#E2E8F0] overflow-hidden">
              {hashtags.map((tag) => (
                <div key={tag.id} className="p-2.5 flex items-center justify-between hover:bg-[#F8FAFC]">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${tag.color}`} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${tag.bgColor} ${tag.textColor}`}
                    >
                      {tag.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteHashtag(tag.id)}
                    className="p-1 text-[#94A3B8] hover:text-rose-600 transition-colors"
                    title="Xóa nhãn"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-5 py-3 bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#182538] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#24334B]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
