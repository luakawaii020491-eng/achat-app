import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Store,
  ChevronDown,
  Radio,
  ExternalLink,
  Printer,
  Sparkles,
  MessageSquare,
  ScanBarcode,
  Facebook,
  Truck,
  Receipt,
  Building,
  BookOpen,
  HelpCircle,
  Keyboard,
  LogOut,
  Pin,
  UserPlus,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { StaffMember, Branch } from '../types';

interface HeaderProps {
  onOpenQuickSearch: () => void;
  onOpenCreateOrder: () => void;
  onOpenSettings: () => void;
  onNavigateToSocial: () => void;
  onOpenBarcodeStockIn: () => void;
  activeBranch: string;
  onChangeBranch: (branch: string) => void;
  onNavigateToLive: () => void;
  isLiveActive: boolean;
  totalPendingOrders: number;
  unreadChatCount: number;
  currentStaff?: StaffMember;
  onOpenStaffManagement?: () => void;
  onOpenShippingCarriers?: () => void;
  onOpenAiTraining?: () => void;
  branches?: Branch[];
  onOpenBranchManagement?: () => void;
  onOpenCodReconciliation?: () => void;
  onOpenFanpageConnect?: () => void;
  onOpenStaffAuth?: () => void;
  onOpenHelpCenter?: (tab?: 'overview' | 'facebook' | 'carriers' | 'order_closing' | 'print_pdf' | 'shortcuts' | 'tax') => void;
  fanpageCount?: number;
  carrierCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickSearch,
  onOpenCreateOrder,
  onOpenSettings,
  onNavigateToSocial,
  onOpenBarcodeStockIn,
  activeBranch,
  onChangeBranch,
  onNavigateToLive,
  isLiveActive,
  totalPendingOrders,
  unreadChatCount,
  currentStaff,
  onOpenStaffManagement,
  onOpenShippingCarriers,
  onOpenAiTraining,
  branches = [],
  onOpenBranchManagement,
  onOpenCodReconciliation,
  onOpenFanpageConnect,
  onOpenStaffAuth,
  onOpenHelpCenter,
  fanpageCount = 4,
  carrierCount = 8,
}) => {
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isStaffOnline, setIsStaffOnline] = useState(true);

  // Fallback branch names if array is empty
  const displayBranches = branches.length > 0 
    ? branches 
    : [
        { id: 'branch-1', name: 'Kho Tổng - TP. Hồ Chí Minh', code: 'KHO-SGN-01', address: '45 Lê Văn Sỹ, Q.3, TP.HCM', phone: '0988.999.888' },
        { id: 'branch-2', name: 'Chi nhánh Cầu Giấy - Hà Nội', code: 'KHO-HAN-01', address: '125 Cầu Giấy, Q.Cầu Giấy, HN', phone: '0977.223.344' },
        { id: 'branch-3', name: 'Kho trung chuyển Hải Châu - Đà Nẵng', code: 'KHO-DNG-01', address: '78 Nguyễn Văn Linh, Đà Nẵng', phone: '0912.334.455' },
      ];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-3 md:px-5 shadow-xs">
      {/* Zone 1: Brand & Branch selector */}
      <div className="flex items-center gap-2.5">
        {/* Achat Logo Mark */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0088FF] text-white font-extrabold shadow-xs">
            <span className="text-base font-black tracking-tight">A</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold leading-none text-[#0F172A] tracking-tight">
                Achat
              </span>
              <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-[#0088FF]">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-[#64748B]">binbinbobo999</span>
          </div>
        </div>

        <div className="hidden md:block h-5 w-[1px] bg-[#E2E8F0]" />

        {/* Branch dropdown with Add Branch action */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] transition-colors"
          >
            <Store className="h-3.5 w-3.5 text-[#0088FF]" />
            <span className="max-w-[140px] truncate">{activeBranch}</span>
            <ChevronDown className="h-3 w-3 text-[#94A3B8]" />
          </button>

          {showBranchMenu && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-2 py-1 border-b border-[#F1F5F9] mb-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Chi nhánh làm việc ({displayBranches.length})
                </span>
                {onOpenBranchManagement && (
                  <button
                    onClick={() => {
                      setShowBranchMenu(false);
                      onOpenBranchManagement();
                    }}
                    className="text-[11px] text-[#0088FF] font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Thêm mới</span>
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                {displayBranches.map((b) => (
                  <button
                    key={b.id || b.name}
                    onClick={() => {
                      onChangeBranch(b.name);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left rounded-lg p-2 text-xs transition-colors ${
                      activeBranch === b.name
                        ? 'bg-[#EBF5FF] text-[#0088FF] font-semibold border border-[#0088FF]/30'
                        : 'text-[#334155] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{b.name}</span>
                      {b.code && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {b.code}
                        </span>
                      )}
                    </div>
                    {b.address && (
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {b.address}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {onOpenBranchManagement && (
                <div className="pt-2 mt-1 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => {
                      setShowBranchMenu(false);
                      onOpenBranchManagement();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#1E293B] transition-colors"
                  >
                    <Building className="h-3.5 w-3.5 text-[#0088FF]" />
                    <span>Quản lý tất cả chi nhánh ({displayBranches.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zone 1.5: Connection Status Indicators (Facebook & Carriers) */}
      <div className="hidden xl:flex items-center gap-2">
        {/* Facebook Connection Status */}
        {onOpenFanpageConnect && (
          <button
            onClick={onOpenFanpageConnect}
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
            title="Đã kết nối Facebook Graph API & Webhook"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Facebook className="h-3.5 w-3.5 text-[#1877F2]" />
            <span className="font-semibold text-[11px]">FB: {fanpageCount} Page</span>
          </button>
        )}

        {/* Carrier Connection Status */}
        {onOpenShippingCarriers && (
          <button
            onClick={onOpenShippingCarriers}
            className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
            title="Đã kết nối API GHN, GHTK, Viettel Post, J&T, Best Express"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <Truck className="h-3.5 w-3.5 text-[#0088FF]" />
            <span className="font-semibold text-[11px]">Vận chuyển: {carrierCount}/8 ĐVVC</span>
          </button>
        )}

        {/* Quick COD / Bank Transfer Reconciliation */}
        {onOpenCodReconciliation && (
          <button
            onClick={onOpenCodReconciliation}
            className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-800 hover:bg-amber-100 transition-colors"
            title="Mở bảng đối soát đơn đã chuyển tiền / COD"
          >
            <Receipt className="h-3.5 w-3.5 text-amber-600" />
            <span className="font-semibold text-[11px]">Đối soát COD</span>
          </button>
        )}
      </div>

      {/* Zone 2: Global Search Bar */}
      <div className="flex-1 max-w-sm mx-3 hidden lg:block">
        <button
          onClick={onOpenQuickSearch}
          className="w-full flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="truncate">Tìm đơn, SĐT, SKU...</span>
          </div>
          <kbd className="rounded border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#64748B]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Shortcuts */}
      <div className="flex items-center gap-2">
        {/* Direct Social Channel shortcut (Gộp page chốt đơn) */}
        <button
          onClick={onNavigateToSocial}
          className="flex items-center gap-1.5 rounded-lg border border-[#0088FF]/30 bg-[#EFF6FF] px-2.5 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-[#DBEAFE] transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chốt đơn Fanpage</span>
          {unreadChatCount > 0 && (
            <span className="rounded-full bg-rose-500 text-white text-[10px] font-mono px-1.5 py-0.2">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Quick Barcode Stock-in */}
        <button
          onClick={onOpenBarcodeStockIn}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          title="Nhập kho theo mã vạch"
        >
          <ScanBarcode className="h-3.5 w-3.5 text-emerald-600" />
          <span>Nhập kho Barcode</span>
        </button>

        {/* Quick Add Order Button */}
        <button
          onClick={onOpenCreateOrder}
          className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0077E6] active:bg-[#0066CC] transition-colors whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tạo đơn hàng</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {totalPendingOrders > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 px-2">
                <span className="text-xs font-bold text-[#0F172A]">Thông báo đơn hàng</span>
                <span className="text-[11px] text-[#0088FF] font-medium">Đã đọc tất cả</span>
              </div>
              <div className="divide-y divide-[#F1F5F9] text-xs">
                <div className="p-2 hover:bg-[#F8FAFC] rounded-md transition-colors">
                  <div className="font-medium text-[#1E293B]">J&T Express đã lấy hàng</div>
                  <div className="text-[11px] text-[#64748B]">Vận đơn JT88921045 đã được phân bổ về bưu cục phát</div>
                  <div className="text-[10px] text-[#94A3B8] mt-1">10 phút trước</div>
                </div>
                <div className="p-2 hover:bg-[#F8FAFC] rounded-md transition-colors">
                  <div className="font-medium text-[#1E293B]">Best Express đồng bộ mã bưu gửi</div>
                  <div className="text-[11px] text-[#64748B]">Trạm HUB-SGN-NORTH đã tiếp nhận kiện hàng</div>
                  <div className="text-[10px] text-[#94A3B8] mt-1">45 phút trước</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile / Staff switcher dropdown button (Image 7) */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            title={currentStaff ? `Nhân viên đang đăng nhập: ${currentStaff.name} (${currentStaff.roleTitle})` : 'Tài khoản người dùng'}
          >
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold ${
              currentStaff?.avatarColor || 'bg-[#0088FF]'
            }`}>
              {currentStaff?.avatarInitials || 'KD'}
              {isStaffOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-semibold text-[#1E293B] leading-tight flex items-center gap-1">
                <span>{currentStaff ? currentStaff.name : 'Đỗ Văn Khuyên'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </span>
              <span className="text-[10px] text-[#64748B]">
                {currentStaff ? currentStaff.roleTitle : 'Super Admin'}
              </span>
            </div>
          </button>

          {/* Profile Popover matching Image 7 */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#CBD5E1] bg-white p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header with Avatar, Name & Online toggle switch */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold shadow-xs ${currentStaff?.avatarColor || 'bg-indigo-600'}`}>
                    {currentStaff?.avatarInitials || 'KD'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0F172A] leading-tight">
                      {currentStaff?.name || 'Đỗ Văn Khuyên'}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isStaffOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
                    </div>
                  </div>
                </div>

                {/* Online toggle switch matching Image 7 */}
                <button
                  type="button"
                  onClick={() => setIsStaffOnline(!isStaffOnline)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isStaffOnline ? 'bg-[#0088FF]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isStaffOnline ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Items matching Image 7 */}
              <div className="py-2 space-y-0.5 text-xs">
                {/* 1. Đóng góp ý kiến */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    alert('Cảm ơn bạn đã đóng góp ý kiến để hoàn thiện Achat GO!');
                  }}
                  className="w-full flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-800">Đóng góp ý kiến</div>
                    <div className="text-[10px] text-slate-400">Góp phần cải thiện Kênh Social</div>
                  </div>
                </button>

                {/* 2. Cập nhật mới (with badge 1 & pin) */}
                <div className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-800">Cập nhật mới</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      1
                    </span>
                    <Pin className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* 3. Hướng dẫn sử dụng */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenHelpCenter) {
                      onOpenHelpCenter('overview');
                    }
                  }}
                  className="w-full flex items-center justify-between rounded-lg p-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-800">Hướng dẫn sử dụng</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 -rotate-90" />
                </button>

                {/* 4. Trung tâm trợ giúp Achat */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenHelpCenter) {
                      onOpenHelpCenter('overview');
                    }
                  }}
                  className="w-full flex items-center justify-between rounded-lg p-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-800">Trung tâm trợ giúp Achat</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 -rotate-90" />
                </button>

                {/* 5. Phím tắt & mẹo (Alt+?) */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenHelpCenter) {
                      onOpenHelpCenter('shortcuts');
                    }
                  }}
                  className="w-full flex items-center justify-between rounded-lg p-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Keyboard className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-800">Phím tắt &amp; mẹo (Alt+?)</span>
                  </div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                    Alt+?
                  </span>
                </button>
              </div>

              {/* Phân quyền & Quản lý */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                {onOpenStaffManagement && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenStaffManagement();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg p-2 text-left text-[#0088FF] hover:bg-blue-50 font-semibold transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#0088FF]" />
                    <span>Phân quyền nhân viên</span>
                  </button>
                )}

                {onOpenStaffAuth && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenStaffAuth();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg p-2 text-left text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                  >
                    <UserPlus className="h-4 w-4 text-slate-500" />
                    <span>Đổi tài khoản / Đăng ký mới</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenStaffAuth) onOpenStaffAuth();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-lg p-2 text-left text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
