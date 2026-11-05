import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  RotateCcw,
  Check,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Calendar,
  Sliders,
  Sparkles,
  ChevronDown,
  Building,
  Package,
  User,
  Users,
  Truck,
  DollarSign,
  AlertTriangle,
  Receipt,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  OrderFilterCriteria,
  SavedOrderFilter,
  ShippingCarrier,
  Branch,
  StaffMember,
  Product,
  Customer,
} from '../types';
import { formatVND } from '../utils/formatters';

interface OrderFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: OrderFilterCriteria;
  onChangeCriteria: (newCriteria: OrderFilterCriteria) => void;
  onApply: () => void;
  onReset: () => void;
  branches?: Branch[];
  products?: Product[];
  staffList?: StaffMember[];
  customers?: Customer[];
  carriers?: ShippingCarrier[];
  savedFilters: SavedOrderFilter[];
  onSaveFilter: (name: string, criteria: OrderFilterCriteria) => void;
  onDeleteSavedFilter: (id: string) => void;
  onApplySavedFilter: (filter: SavedOrderFilter) => void;
  totalFilteredCount?: number;
}

export const OrderFilterDrawer: React.FC<OrderFilterDrawerProps> = ({
  isOpen,
  onClose,
  criteria,
  onChangeCriteria,
  onApply,
  onReset,
  branches = [],
  products = [],
  staffList = [],
  customers = [],
  carriers = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteSavedFilter,
  onApplySavedFilter,
  totalFilteredCount,
}) => {
  if (!isOpen) return null;

  // Search string inside filter drawer to find a specific filter field quickly (Image 1 "Tìm kiếm bộ lọc")
  const [filterSearch, setFilterSearch] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [presetSaveSuccess, setPresetSaveSuccess] = useState(false);

  // Helper to update individual criterion
  const updateField = <K extends keyof OrderFilterCriteria>(
    field: K,
    val: OrderFilterCriteria[K]
  ) => {
    onChangeCriteria({
      ...criteria,
      [field]: val,
    });
  };

  // Search filter helper
  const matchesSearch = (label: string) => {
    if (!filterSearch.trim()) return true;
    return label.toLowerCase().includes(filterSearch.toLowerCase().trim());
  };

  // Count how many criteria are actively set
  const activeCount = useMemo(() => {
    let count = 0;
    if (criteria.branch) count++;
    if (criteria.productId) count++;
    if (criteria.createdByStaff) count++;
    if (criteria.assignedStaff) count++;
    if (criteria.customerPhone) count++;
    if (criteria.carrierId) count++;
    if (criteria.status && criteria.status !== 'all') count++;
    if (criteria.paymentStatus && criteria.paymentStatus !== 'all') count++;
    if (criteria.packagingStatus && criteria.packagingStatus !== 'all') count++;
    if (criteria.shippingStatus && criteria.shippingStatus !== 'all') count++;
    if (criteria.printStatus && criteria.printStatus !== 'all') count++;
    if (criteria.dateRangePreset && criteria.dateRangePreset !== 'all') count++;
    if (criteria.channel && criteria.channel !== 'all') count++;
    if (criteria.codOption && criteria.codOption !== 'all') count++;
    if (criteria.warehouseExportStatus && criteria.warehouseExportStatus !== 'all') count++;
    if (criteria.orderProcessingStatus && criteria.orderProcessingStatus !== 'all') count++;
    if (criteria.minTotal || criteria.maxTotal) count++;
    if (criteria.minWeight || criteria.maxWeight) count++;
    if (criteria.boomRiskOnly) count++;
    if (criteria.productTag) count++;
    return count;
  }, [criteria]);

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveFilter(newPresetName.trim(), criteria);
    setNewPresetName('');
    setShowSavePresetModal(false);
    setPresetSaveSuccess(true);
    setTimeout(() => setPresetSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-all animate-in fade-in duration-200">
      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col z-50 border-l border-[#E2E8F0] animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0F172A]">Bộ lọc</h2>
            {activeCount > 0 && (
              <span className="rounded-full bg-[#0088FF] text-white text-[11px] font-bold px-2 py-0.5">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavePresetModal(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#0088FF] hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              title="Lưu bộ lọc này để lần sau không cần chọn lại"
            >
              <BookmarkPlus className="h-4 w-4" />
              <span>Lưu mẫu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Saved Filters Quick Selector Bar */}
        {savedFilters.length > 0 && (
          <div className="px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="h-3 w-3 text-[#0088FF]" />
                Mẫu bộ lọc đã lưu ({savedFilters.length})
              </span>
              <span className="text-[10px] text-[#94A3B8]">Bấm để áp dụng nhanh</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {savedFilters.map((sf) => (
                <div
                  key={sf.id}
                  className="inline-flex items-center gap-1 rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-medium text-[#334155] hover:border-[#0088FF] hover:text-[#0088FF] transition-colors shadow-2xs group"
                >
                  <button
                    onClick={() => onApplySavedFilter(sf)}
                    className="flex items-center gap-1 text-left"
                  >
                    <span>{sf.name}</span>
                  </button>
                  {!sf.isSystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSavedFilter(sf.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-1 p-0.5 rounded-full"
                      title="Xóa mẫu lọc này"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Save current filter as preset */}
        {showSavePresetModal && (
          <div className="p-4 bg-[#EFF6FF] border-b border-blue-200">
            <form onSubmit={handleSavePreset} className="space-y-2">
              <div className="text-xs font-bold text-[#1E3A8A]">
                Lưu cấu hình lọc hiện tại thành mẫu dùng lại:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Ví dụ: Đơn COD chờ gói Hà Nội..."
                  className="flex-1 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  className="rounded-md bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0077E6] disabled:opacity-50"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setShowSavePresetModal(false)}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-[#64748B]"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {presetSaveSuccess && (
          <div className="mx-4 mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>Đã lưu mẫu lọc thành công! Bạn có thể chọn lại bất cứ lúc nào.</span>
          </div>
        )}

        {/* Search within filters (Matching Image 1: "Tìm kiếm bộ lọc") */}
        <div className="px-5 pt-3 pb-2 sticky top-[65px] bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Tìm kiếm bộ lọc..."
              className="w-full rounded-lg border border-[#CBD5E1] bg-white pl-9 pr-8 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0088FF] focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
            />
            {filterSearch && (
              <button
                onClick={() => setFilterSearch('')}
                className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-[#334155]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Filter Fields Container (Exact matches to Images 1 & 2) */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 text-xs">

          {/* 1. Chi nhánh tạo đơn */}
          {matchesSearch('Chi nhánh tạo đơn') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Chi nhánh tạo đơn</label>
              <select
                value={criteria.branch || ''}
                onChange={(e) => updateField('branch', e.target.value || undefined)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="">Chọn chi nhánh tạo đơn</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Sản phẩm */}
          {matchesSearch('Sản phẩm') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Sản phẩm</label>
              <select
                value={criteria.productId || ''}
                onChange={(e) => updateField('productId', e.target.value || undefined)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.variants.map((v) => v.sku).join(', ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Nhân viên tạo đơn */}
          {matchesSearch('Nhân viên tạo đơn') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Nhân viên tạo đơn</label>
              <select
                value={criteria.createdByStaff || ''}
                onChange={(e) => updateField('createdByStaff', e.target.value || undefined)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="">Chọn nhân viên tạo đơn</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Nhân viên phụ trách */}
          {matchesSearch('Nhân viên phụ trách') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Nhân viên phụ trách</label>
              <select
                value={criteria.assignedStaff || ''}
                onChange={(e) => updateField('assignedStaff', e.target.value || undefined)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="">Chọn nhân viên phụ trách</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 5. Khách hàng */}
          {matchesSearch('Khách hàng') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Khách hàng</label>
              <select
                value={criteria.customerPhone || ''}
                onChange={(e) => updateField('customerPhone', e.target.value || undefined)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="">Chọn khách hàng</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.phone}>
                    {c.name} - {c.phone} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Đối tác vận chuyển */}
          {matchesSearch('Đối tác vận chuyển') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Đối tác vận chuyển</label>
              <select
                value={criteria.carrierId || ''}
                onChange={(e) => updateField('carrierId', e.target.value || undefined)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="">Chọn đối tác vận chuyển</option>
                {carriers.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} ({car.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 7. Trạng thái đơn hàng */}
          {matchesSearch('Trạng thái') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái</label>
              <select
                value={criteria.status || 'all'}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái đơn hàng</option>
                <option value="pending">Chờ xác nhận / Chờ duyệt</option>
                <option value="confirmed">Đã xác nhận / Chờ đóng gói</option>
                <option value="shipping">Đang giao hàng (Đã đẩy ĐVVC)</option>
                <option value="delivered">Đã giao thành công</option>
                <option value="returned">Chuyển hoàn</option>
                <option value="cancelled">Đã hủy đơn</option>
              </select>
            </div>
          )}

          {/* 8. Trạng thái thanh toán */}
          {matchesSearch('Trạng thái thanh toán') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái thanh toán</label>
              <select
                value={criteria.paymentStatus || 'all'}
                onChange={(e) => updateField('paymentStatus', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái thanh toán</option>
                <option value="paid">Đã thanh toán (Chuyển khoản / Đã thu COD)</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="partially_paid">Thanh toán một phần (Đã cọc)</option>
              </select>
            </div>
          )}

          {/* 9. Trạng thái đóng gói */}
          {matchesSearch('Trạng thái đóng gói') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái đóng gói</label>
              <select
                value={criteria.packagingStatus || 'all'}
                onChange={(e) => updateField('packagingStatus', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái đóng gói</option>
                <option value="unpacked">Chưa đóng gói</option>
                <option value="packed">Đã đóng gói</option>
              </select>
            </div>
          )}

          {/* 10. Trạng thái giao hàng */}
          {matchesSearch('Trạng thái giao hàng') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái giao hàng</label>
              <select
                value={criteria.shippingStatus || 'all'}
                onChange={(e) => updateField('shippingStatus', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái giao hàng</option>
                <option value="waiting_pickup">Chờ bưu tá lấy hàng</option>
                <option value="delivering">Đang giao hàng</option>
                <option value="delivered">Giao hàng thành công</option>
                <option value="failed">Giao hàng thất bại / Chuyển hoàn</option>
              </select>
            </div>
          )}

          {/* 11. Trạng thái in hóa đơn */}
          {matchesSearch('Trạng thái in hóa đơn') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái in hóa đơn</label>
              <select
                value={criteria.printStatus || 'all'}
                onChange={(e) => updateField('printStatus', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái in hóa đơn</option>
                <option value="printed">Đã in phiếu giao hàng</option>
                <option value="unprinted">Chưa in phiếu giao hàng</option>
              </select>
            </div>
          )}

          {/* 12. Ngày tạo (from Image 2) */}
          {matchesSearch('Ngày tạo') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Ngày tạo</label>
              <select
                value={criteria.dateRangePreset || 'all'}
                onChange={(e) => updateField('dateRangePreset', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn ngày tạo</option>
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="90days">90 ngày gần nhất (Chuẩn Achat)</option>
              </select>
            </div>
          )}

          {/* 13. Nguồn bán hàng (from Image 2) */}
          {matchesSearch('Nguồn bán hàng') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Nguồn bán hàng</label>
              <select
                value={criteria.channel || 'all'}
                onChange={(e) => updateField('channel', e.target.value)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn nguồn bán hàng</option>
                <option value="facebook">Facebook Chat / Messenger</option>
                <option value="livestream">Livestream Chốt đơn</option>
                <option value="pos">Tại cửa hàng (POS)</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="shopee">Shopee</option>
                <option value="website">Website</option>
              </select>
            </div>
          )}

          {/* 14. Thu hộ COD (from Image 2) */}
          {matchesSearch('Thu hộ COD') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Thu hộ COD</label>
              <select
                value={criteria.codOption || 'all'}
                onChange={(e) => updateField('codOption', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn thu hộ COD</option>
                <option value="has_cod">Có thu tiền COD (&gt; 0đ)</option>
                <option value="no_cod">Không thu COD (0đ / Đã chuyển khoản)</option>
                <option value="cod_above_500k">COD cao (&gt; 500,000đ)</option>
              </select>
            </div>
          )}

          {/* 15. Trạng thái xuất kho (from Image 2) */}
          {matchesSearch('Trạng thái xuất kho') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái xuất kho</label>
              <select
                value={criteria.warehouseExportStatus || 'all'}
                onChange={(e) => updateField('warehouseExportStatus', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái xuất kho</option>
                <option value="unexported">Chưa xuất kho</option>
                <option value="exported">Đã xuất kho</option>
              </select>
            </div>
          )}

          {/* 16. Trạng thái xử lý đơn hàng (from Image 2) */}
          {matchesSearch('Trạng thái xử lý đơn hàng') && (
            <div className="space-y-1">
              <label className="font-medium text-[#334155] block">Trạng thái xử lý đơn hàng</label>
              <select
                value={criteria.orderProcessingStatus || 'all'}
                onChange={(e) => updateField('orderProcessingStatus', e.target.value as any)}
                className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#0088FF] focus:outline-none"
              >
                <option value="all">Chọn trạng thái xử lý đơn hàng</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Đã xử lý hoàn tất</option>
              </select>
            </div>
          )}

          {/* Custom Extended Filters: User explicitly requested: "bạn có thể thêm vài tuỳ biến của lọc đơn nữa" */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <div className="font-bold text-[#0088FF] text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tuỳ biến nâng cao mở rộng</span>
            </div>

            {/* Khoảng tiền đơn hàng */}
            <div className="space-y-1 mb-3">
              <label className="font-medium text-[#334155] block">Giá trị đơn hàng (VNĐ)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ (0đ)"
                  value={criteria.minTotal || ''}
                  onChange={(e) => updateField('minTotal', e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-md border border-[#CBD5E1] px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0088FF]"
                />
                <input
                  type="number"
                  placeholder="Đến (VNĐ)"
                  value={criteria.maxTotal || ''}
                  onChange={(e) => updateField('maxTotal', e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-md border border-[#CBD5E1] px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0088FF]"
                />
              </div>
            </div>

            {/* Khối lượng kiện hàng */}
            <div className="space-y-1 mb-3">
              <label className="font-medium text-[#334155] block">Khối lượng kiện (gram)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ (gram)"
                  value={criteria.minWeight || ''}
                  onChange={(e) => updateField('minWeight', e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-md border border-[#CBD5E1] px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0088FF]"
                />
                <input
                  type="number"
                  placeholder="Đến (gram)"
                  value={criteria.maxWeight || ''}
                  onChange={(e) => updateField('maxWeight', e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-md border border-[#CBD5E1] px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0088FF]"
                />
              </div>
            </div>

            {/* Cảnh báo khách bom hàng */}
            <label className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer text-[#92400E]">
              <input
                type="checkbox"
                checked={criteria.boomRiskOnly || false}
                onChange={(e) => updateField('boomRiskOnly', e.target.checked)}
                className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-xs">Chỉ lọc khách có cảnh báo bom hàng</span>
            </label>
          </div>

        </div>

        {/* Drawer Bottom Action Bar (Matching Image 1 & 2) */}
        <div className="border-t border-[#E2E8F0] p-4 bg-white flex items-center gap-3 sticky bottom-0 z-10 shadow-md">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-lg border border-[#EF4444] text-[#EF4444] hover:bg-rose-50 py-2.5 text-xs font-bold transition-colors text-center"
          >
            Xóa bộ lọc
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#0088FF] hover:bg-[#0077E6] text-white py-2.5 text-xs font-bold transition-colors shadow-xs text-center flex items-center justify-center gap-1.5"
          >
            <span>Lọc</span>
            {totalFilteredCount !== undefined && (
              <span className="bg-white/20 rounded-full px-1.5 py-0.2 text-[10px]">
                ({totalFilteredCount})
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
