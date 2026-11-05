import React, { useState } from 'react';
import {
  X,
  Store,
  Truck,
  Printer,
  CheckCircle2,
  RefreshCw,
  Save,
  ShieldCheck,
  Facebook,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [storeName, setStoreName] = useState('binbinbobo999');
  const [storeDomain, setStoreDomain] = useState('binbinbobo999.myachat.com');
  const [hotline, setHotline] = useState('0916636785');
  const [defaultCarrier, setDefaultCarrier] = useState<'jnt' | 'best' | 'ghn' | 'ghtk'>('jnt');
  const [jtConnected, setJtConnected] = useState(true);
  const [bestConnected, setBestConnected] = useState(true);
  const [ghnConnected, setGhnConnected] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-[#0088FF]" />
            <h2 className="text-base font-bold text-[#0F172A]">
              Cấu hình shop &amp; Đơn vị vận chuyển (J&amp;T &amp; Best Express)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E2E8F0]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Store info */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
              1. Thông tin shop Achat GO
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#475569]">Tên hiển thị shop</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 outline-none focus:border-[#0088FF]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#475569]">Tên miền quản trị</label>
                <input
                  type="text"
                  disabled
                  value={storeDomain}
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-1.5 text-[#64748B] font-mono outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-[#475569]">Hotline bán hàng & in trên vận đơn</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 font-mono outline-none focus:border-[#0088FF]"
              />
            </div>
          </div>

          {/* Carrier Connections: J&T & Best Express */}
          <div className="space-y-3 border-t border-[#F1F5F9] pt-4">
            <h3 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#0088FF]" />
              2. Kết nối API Đơn vị vận chuyển (J&T Express & Best Express)
            </h3>

            <div className="space-y-2.5">
              {/* J&T */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white font-bold text-xs px-2 py-1 rounded">
                    J&T
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">J&T Express Việt Nam</div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      Partner: JT_BINBIN999 · Tự động sinh mã bưu cục phát
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setJtConnected(!jtConnected)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    jtConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {jtConnected ? 'Đã kết nối' : 'Tạm ngắt'}
                </button>
              </div>

              {/* Best Express */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 text-black font-bold text-xs px-2 py-1 rounded">
                    BEST
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Best Express (Smart Logistics)</div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      Partner: BEST_VN_999BOBO · Đẩy đơn tự động qua API
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBestConnected(!bestConnected)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    bestConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {bestConnected ? 'Đã kết nối' : 'Tạm ngắt'}
                </button>
              </div>

              {/* GHN */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded">
                    GHN
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">Giao Hàng Nhanh (GHN)</div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      Mã Shop: GHN_SHOP_49102 · Kết nối API hoạt động
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGhnConnected(!ghnConnected)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    ghnConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ghnConnected ? 'Đã kết nối' : 'Tạm ngắt'}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="border-t border-[#F1F5F9] pt-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-rose-700">Khôi phục dữ liệu ban đầu</div>
                <div className="text-[11px] text-[#64748B]">Xóa các đơn test và tải lại bộ dữ liệu chuẩn Achat</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn làm mới toàn bộ dữ liệu mẫu Achat GO không?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Khôi phục mẫu</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 font-semibold text-[#475569] hover:bg-[#F1F5F9]"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-4 py-2 font-bold text-white hover:bg-[#0077E6]"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saveSuccess ? 'Đã lưu!' : 'Lưu cấu hình'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
