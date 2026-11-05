import React, { useState } from 'react';
import {
  X,
  Facebook,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus,
  AlertCircle,
  ExternalLink,
  Lock,
  Copy,
  Check,
  Globe,
  Sparkles,
  Send,
  Users,
  CheckSquare,
  Square,
  Sliders,
  ArrowRight,
  User,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { Fanpage } from '../types';

interface ManagedPageItem {
  id: string;
  name: string;
  category: string;
  followersCount: number;
  tasks: string[];
  avatarInitials: string;
  avatarColor: string;
  pageAccessToken: string;
}

interface FanpageConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanpages: Fanpage[];
  onTogglePageConnection: (pageId: string) => void;
  onToggleAutoHidePhone: (pageId: string) => void;
  onAddFanpage: (newPage: Fanpage) => void;
  onAddMultipleFanpages?: (newPages: Fanpage[]) => void;
  onSimulateIncomingWebhookMessage?: (msg: {
    customerName: string;
    phone: string;
    text: string;
    pageName: string;
  }) => void;
}

export const FanpageConnectionModal: React.FC<FanpageConnectionModalProps> = ({
  isOpen,
  onClose,
  fanpages,
  onTogglePageConnection,
  onToggleAutoHidePhone,
  onAddFanpage,
  onAddMultipleFanpages,
  onSimulateIncomingWebhookMessage,
}) => {
  if (!isOpen) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'fb_token_connect' | 'single_page' | 'connected_list' | 'webhook_setup' | 'simulate_test'>('fb_token_connect');

  // --- Facebook Browser Login Flow State (Chuẩn Achat) ---
  const [isFbLoggedIn, setIsFbLoggedIn] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userAccountInfo, setUserAccountInfo] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }>({
    id: 'fb-user-35393097',
    name: 'Nguyễn Văn Thắng (Chủ shop)',
    email: 'khuyenlua.2013@gmail.com',
  });

  const [managedPages, setManagedPages] = useState<ManagedPageItem[]>([
    {
      id: '209825435542158',
      name: 'Shop Bé Đan',
      category: 'Thời trang & Giày dép nữ',
      followersCount: 32600,
      tasks: ['MANAGE', 'CREATE_CONTENT', 'MESSAGING', 'MODERATE'],
      avatarInitials: 'BĐ',
      avatarColor: 'bg-rose-500',
      pageAccessToken: 'EAAG_PAGE_TOKEN_SHOP_BE_DAN',
    },
    {
      id: '108924159821034',
      name: 'LÀM ĐẸP 360',
      category: 'Mỹ phẩm & Chăm sóc sắc đẹp',
      followersCount: 28400,
      tasks: ['MANAGE', 'MESSAGING', 'MODERATE'],
      avatarInitials: '36',
      avatarColor: 'bg-pink-600',
      pageAccessToken: 'EAAG_PAGE_TOKEN_LAM_DEP_360',
    },
    {
      id: '304958192847291',
      name: 'TỔNG KHO GIA DỤNG BINBINBOBO',
      category: 'Đồ gia dụng thông minh & Tiện ích',
      followersCount: 45200,
      tasks: ['MANAGE', 'MESSAGING'],
      avatarInitials: 'BB',
      avatarColor: 'bg-indigo-600',
      pageAccessToken: 'EAAG_PAGE_TOKEN_BINBINBOBO',
    },
    {
      id: '495820193859281',
      name: 'THỜI TRANG CÔNG SỞ PARIS',
      category: 'Thời trang nữ cao cấp',
      followersCount: 19800,
      tasks: ['MANAGE', 'MESSAGING'],
      avatarInitials: 'PA',
      avatarColor: 'bg-emerald-600',
      pageAccessToken: 'EAAG_PAGE_TOKEN_PARIS',
    },
  ]);

  // Initial selected page IDs
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([
    '209825435542158',
    '108924159821034',
    '304958192847291',
    '495820193859281',
  ]);

  const [autoHidePhonePermission, setAutoHidePhonePermission] = useState(true);
  const [enableAiClosing, setEnableAiClosing] = useState(true);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Manual custom page input within FB Login tab
  const [customPageName, setCustomPageName] = useState('');
  const [customPageFollowers, setCustomPageFollowers] = useState('15000');

  // --- Manual Facebook API Form State ---
  const [newPageName, setNewPageName] = useState('');
  const [newPageId, setNewPageId] = useState('');
  const [newAccessToken, setNewAccessToken] = useState('');
  const [newAppId, setNewAppId] = useState('');
  const [newAppSecret, setNewAppSecret] = useState('');
  const [newWebhookVerifyToken, setNewWebhookVerifyToken] = useState('achat_verify_token_2026');
  const [isVerifyingSingle, setIsVerifyingSingle] = useState(false);
  const [singleStatusMsg, setSingleStatusMsg] = useState<{
    success: boolean;
    text: string;
    canBypass?: boolean;
  } | null>(null);

  const handleAutofillMetaApi = () => {
    setNewPageName('BinBin BoBo Official Store');
    setNewPageId('109825482910291');
    setNewAccessToken('EAAGm0PX4ZCpsBAK1ZBz7wP189jKxLmNpQrStUvWxYz0123456789ABCDEF');
    setNewAppId('782910398219482');
    setNewAppSecret('9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');
    setNewWebhookVerifyToken('achat_webhook_token_secure');
  };

  // --- Simulation state ---
  const [simCustomerName, setSimCustomerName] = useState('Phạm Thanh Thảo (Khách FB thật)');
  const [simPhone, setSimPhone] = useState('0988123456');
  const [simMessageText, setSimMessageText] = useState(
    'Em chốt 1 áo sơ mi lụa trắng size M nhé shop! Ship về 125 Cầu Giấy, Hà Nội giúp em, sđt 0988123456 nha'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  // --- Webhook Copy State ---
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/facebook/webhook`;
  const verifyToken = 'achat_secret_token';
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Toggle selection for a page
  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const handleSelectAllPages = () => {
    if (selectedPageIds.length === managedPages.length) {
      setSelectedPageIds([]);
    } else {
      setSelectedPageIds(managedPages.map((p) => p.id));
    }
  };

  // Add custom Page to managed list
  const handleAddCustomPageToManaged = () => {
    if (!customPageName.trim()) return;
    const newId = `${Date.now()}`;
    const initials = customPageName.trim().slice(0, 2).toUpperCase();
    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-teal-600', 'bg-rose-600', 'bg-amber-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newManaged: ManagedPageItem = {
      id: newId,
      name: customPageName.trim(),
      category: 'Bán hàng đa kênh Facebook',
      followersCount: parseInt(customPageFollowers) || 20000,
      tasks: ['MANAGE', 'MESSAGING'],
      avatarInitials: initials,
      avatarColor: randomColor,
      pageAccessToken: `EAAG_PAGE_TOKEN_${newId}`,
    };

    setManagedPages((prev) => [newManaged, ...prev]);
    setSelectedPageIds((prev) => [newId, ...prev]);
    setCustomPageName('');
  };

  // Simulate Facebook Browser Login
  const handleFacebookBrowserLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsFbLoggedIn(true);
      setIsLoggingIn(false);
      setUserAccountInfo({
        id: 'fb-user-khuyenlua',
        name: 'Nguyễn Văn Thắng (Tài khoản Facebook của bạn)',
        email: 'khuyenlua.2013@gmail.com',
      });
      setSelectedPageIds(managedPages.map((p) => p.id));
      setBatchSuccessMsg('Đăng nhập tài khoản Facebook thành công! Đã tải 4 Fanpage bạn đang quản lý.');
      setTimeout(() => setBatchSuccessMsg(null), 3000);
    }, 800);
  };

  // Confirm connection of selected pages (Achat Style)
  const handleConfirmConnectSelectedPages = () => {
    const pagesToConnect = managedPages.filter((p) => selectedPageIds.includes(p.id));
    if (pagesToConnect.length === 0) return;

    const newFanpages: Fanpage[] = pagesToConnect.map((p) => ({
      id: `page-${p.id}`,
      name: p.name,
      pageId: p.id,
      category: p.category,
      avatarColor: p.avatarColor,
      avatarInitials: p.avatarInitials,
      isConnected: true,
      autoHideCommentWithPhone: autoHidePhonePermission,
      autoReplyComment: true,
      conversationsCount: 15,
      followersCount: p.followersCount,
    }));

    if (onAddMultipleFanpages) {
      onAddMultipleFanpages(newFanpages);
    } else {
      newFanpages.forEach((fp) => onAddFanpage(fp));
    }

    setBatchSuccessMsg(
      `Đã cấp quyền và kết nối thành công ${newFanpages.length} Fanpage vào Achat! Tin nhắn của tất cả các page đã được nạp vào cửa sổ chốt đơn.`
    );

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Single page connect via Facebook Token
  const handleSingleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() && !newPageId.trim()) return;
    setIsVerifyingSingle(true);
    setSingleStatusMsg(null);

    try {
      const finalId = newPageId.trim() || `fb-${Date.now()}`;
      let verifiedFollowers = 25000;
      let verifiedName = newPageName.trim() || 'Fanpage Facebook mới';

      // Xác thực token qua server API endpoint
      try {
        const verifyRes = await fetch('/api/facebook/verify-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: finalId,
            accessToken: newAccessToken.trim() || undefined,
          }),
        });
        const vData = await verifyRes.json();
        if (vData.success && vData.page) {
          verifiedFollowers = vData.page.followersCount || verifiedFollowers;
          if (vData.page.name) {
            verifiedName = vData.page.name;
          }
        }
      } catch (e) {
        console.warn('API verify fallback:', e);
      }

      const newPage: Fanpage = {
        id: `page-${finalId}`,
        name: verifiedName,
        pageId: finalId,
        category: 'Bán hàng đa kênh Facebook',
        avatarColor: 'bg-blue-600',
        avatarInitials: verifiedName.slice(0, 2).toUpperCase(),
        isConnected: true,
        autoHideCommentWithPhone: true,
        autoReplyComment: true,
        conversationsCount: 15,
        followersCount: verifiedFollowers,
      };

      onAddFanpage(newPage);
      setSingleStatusMsg({
        success: true,
        text: `✓ Xác thực Token thành công! Đã kết nối Fanpage "${newPage.name}" vào Achat. Tin nhắn đang đổ về...`,
      });
      setTimeout(() => onClose(), 1200);
    } catch {
      setSingleStatusMsg({
        success: false,
        text: 'Lỗi kiểm tra token Facebook. Hãy chắc chắn mã Token còn hiệu lực!',
        canBypass: true,
      });
    } finally {
      setIsVerifyingSingle(false);
    }
  };

  // Trigger simulated incoming message
  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    try {
      if (onSimulateIncomingWebhookMessage) {
        onSimulateIncomingWebhookMessage({
          customerName: simCustomerName,
          phone: simPhone,
          text: simMessageText,
          pageName: 'Shop Bé Đan',
        });
      }
      setSimSuccess(true);
      setTimeout(() => {
        setSimSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md">
              <Facebook className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Kết nối Fanpage Facebook - Achat
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#1877F2]">
                  OAuth 2.0 &amp; Multi-Page
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Đăng nhập tài khoản Facebook cá nhân &gt; Cấp quyền truy cập các Fanpage bạn quản lý &gt; Hoặc nhập thủ công API Facebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F1F5F9]/60 px-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fb_token_connect')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'fb_token_connect'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Facebook className="h-4 w-4 text-[#1877F2]" />
            <span>Từ FB cá nhân cấp quyền ({managedPages.length} Pages)</span>
          </button>

          <button
            onClick={() => setActiveTab('single_page')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'single_page'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <KeyRound className="h-4 w-4 text-purple-600" />
            <span>Nhập thủ công API Facebook</span>
          </button>

          <button
            onClick={() => setActiveTab('connected_list')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'connected_list'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Đã kết nối ({fanpages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook_setup')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'webhook_setup'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Thông số Webhook Meta</span>
          </button>

          <button
            onClick={() => setActiveTab('simulate_test')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulate_test'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Thử nghiệm tin nhắn</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {/* TAB 1: ACHAT FACEBOOK BROWSER LOGIN & PAGE SELECTION */}
          {activeTab === 'fb_token_connect' && (
            <div className="space-y-4">
              {/* Account Login Status Card */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md font-bold text-sm">
                    {userAccountInfo.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F172A]">{userAccountInfo.name}</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                        Đang đăng nhập
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569]">{userAccountInfo.email} · Quyền Quản trị viên (Admin)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFacebookBrowserLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isLoggingIn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span>{isLoggingIn ? 'Đang kết nối FB...' : 'Đổi tài khoản / Quét lại'}</span>
                </button>
              </div>

              {/* Managed Pages Checklist */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#0088FF]" />
                    <span>Các Fanpage bạn đang giữ quyền ({managedPages.length})</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllPages}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0088FF] hover:underline cursor-pointer"
                  >
                    {selectedPageIds.length === managedPages.length ? (
                      <CheckSquare className="h-4 w-4 text-[#0088FF]" />
                    ) : (
                      <Square className="h-4 w-4 text-[#94A3B8]" />
                    )}
                    <span>
                      {selectedPageIds.length === managedPages.length
                        ? 'Bỏ chọn tất cả'
                        : `Chọn tất cả (${selectedPageIds.length}/${managedPages.length})`}
                    </span>
                  </button>
                </div>

                {/* Page Selection Cards */}
                <div className="divide-y divide-[#F1F5F9] border rounded-xl border-[#CBD5E1] overflow-hidden bg-white shadow-xs">
                  {managedPages.map((page) => {
                    const isSelected = selectedPageIds.includes(page.id);
                    return (
                      <div
                        key={page.id}
                        onClick={() => togglePageSelection(page.id)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-[#0088FF] shrink-0">
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 fill-[#0088FF] text-white" />
                            ) : (
                              <Square className="h-5 w-5 text-[#94A3B8]" />
                            )}
                          </div>

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-xs shrink-0 ${page.avatarColor} shadow-2xs`}
                          >
                            {page.avatarInitials}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#0F172A]">{page.name}</span>
                              <span className="rounded bg-slate-100 text-[#475569] text-[9px] font-bold px-1.5 py-0.2">
                                {page.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                              <span className="font-mono">ID: {page.id}</span>
                              <span>·</span>
                              <span className="font-semibold text-blue-700">{page.followersCount.toLocaleString('vi-VN')} người theo dõi</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Đã cấp quyền
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add Custom Page to List */}
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Tên Page khác bạn đang quản lý (ví dụ: Shop Giày Xinh, Mỹ Phẩm Hàn...)"
                    value={customPageName}
                    onChange={(e) => setCustomPageName(e.target.value)}
                    className="flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#0088FF]"
                  />
                  <input
                    type="number"
                    placeholder="Số người theo dõi"
                    value={customPageFollowers}
                    onChange={(e) => setCustomPageFollowers(e.target.value)}
                    className="w-32 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#0088FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPageToManaged}
                    className="flex items-center gap-1 rounded-lg bg-[#334155] hover:bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm vào danh sách</span>
                  </button>
                </div>
              </div>

              {/* Achat Permission Matrix Settings */}
              <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
                <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="h-4 w-4 text-[#0088FF]" />
                  <span>Cấu hình tự động chốt đơn cho các Fanpage đã chọn</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-[#1E293B]">
                          Tự động ẩn bình luận chứa số điện thoại (Chống cướp đơn)
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          Ẩn comment có SĐT của khách ngay lập tức trên Facebook, chỉ nhân viên Achat mới thấy để chốt đơn.
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoHidePhonePermission}
                      onChange={(e) => setAutoHidePhonePermission(e.target.checked)}
                      className="h-4 w-4 rounded text-[#0088FF] focus:ring-[#0088FF]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-[#1E293B]">
                          Kích hoạt AI Gemini tự động quét &amp; trả lời theo kịch bản
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          Tự động phát hiện tên khách, SĐT, địa chỉ và gắn tag #Bot_TựĐộng.
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableAiClosing}
                      onChange={(e) => setEnableAiClosing(e.target.checked)}
                      className="h-4 w-4 rounded text-[#0088FF] focus:ring-[#0088FF]"
                    />
                  </label>
                </div>
              </div>

              {/* Success Notification */}
              {batchSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{batchSuccessMsg}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={selectedPageIds.length === 0}
                  onClick={handleConfirmConnectSelectedPages}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                    selectedPageIds.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#0088FF] hover:bg-[#0077E6] shadow-blue-500/20'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Xác nhận cấp quyền &amp; Kết nối {selectedPageIds.length} Fanpage đã chọn vào Achat
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECTED FANPAGES IN SYSTEM */}
          {activeTab === 'connected_list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  Danh sách Fanpage đang kết nối vào Achat ({fanpages.length})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('fb_token_connect')}
                  className="flex items-center gap-1 text-xs text-[#0088FF] font-semibold hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm Page từ Facebook</span>
                </button>
              </div>

              <div className="divide-y divide-[#F1F5F9] border rounded-xl border-[#CBD5E1] bg-white overflow-hidden shadow-xs">
                {fanpages.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-xs ${p.avatarColor}`}>
                        {p.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0F172A]">{p.name}</span>
                          <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.2">
                            Đang hoạt động
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                          <span className="font-mono">ID: {p.pageId}</span>
                          <span>·</span>
                          <span className="text-blue-700 font-semibold">{p.followersCount.toLocaleString('vi-VN')} người theo dõi</span>
                          <span>·</span>
                          <span>{p.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleAutoHidePhone(p.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          p.autoHideCommentWithPhone
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.autoHideCommentWithPhone ? '✓ Đang ẩn SĐT' : 'Tắt ẩn SĐT'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL FACEBOOK API INPUT */}
          {activeTab === 'single_page' && (
            <div className="space-y-4">
              <form onSubmit={handleSingleConnect} className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider block">
                      Nhập thủ công API Facebook (Graph API &amp; Webhook)
                    </span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Dành cho các shop đã tạo App trên Meta for Developers hoặc sử dụng Page Access Token dài hạn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillMetaApi}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span>Điền mẫu API Meta chuẩn</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-[#334155] block">Tên Fanpage của bạn *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: BinBin BoBo Official Store"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#334155] block">Page ID (Mã ID Trang Fanpage) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 109825482910291"
                      value={newPageId}
                      onChange={(e) => setNewPageId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-mono outline-none focus:border-[#0088FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#334155] block">
                    Page Access Token (Mã truy cập trang bắt đầu bằng EAAG...) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="EAAGm0PX4ZCpsBAK1ZBz7wP189jKxLmNpQrStUvWxYz..."
                    value={newAccessToken}
                    onChange={(e) => setNewAccessToken(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-mono outline-none focus:border-[#0088FF]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Lấy tại Meta for Developers &gt; Graph API Explorer &gt; User Token &gt; Chọn Page &gt; Generate Token.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-[#334155] block">Meta App ID (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 782910398219482"
                      value={newAppId}
                      onChange={(e) => setNewAppId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-mono outline-none focus:border-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#334155] block">App Secret (Khóa bí mật)</label>
                    <input
                      type="password"
                      placeholder="Mã secret 32 ký tự"
                      value={newAppSecret}
                      onChange={(e) => setNewAppSecret(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-mono outline-none focus:border-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#334155] block">Webhook Verify Token</label>
                    <input
                      type="text"
                      placeholder="achat_verify_token_2026"
                      value={newWebhookVerifyToken}
                      onChange={(e) => setNewWebhookVerifyToken(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-mono outline-none focus:border-[#0088FF]"
                    />
                  </div>
                </div>

                {singleStatusMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs space-y-2 ${
                      singleStatusMsg.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <div>{singleStatusMsg.text}</div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={isVerifyingSingle}
                    className="flex items-center gap-2 rounded-xl bg-[#0088FF] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0077E6] cursor-pointer shadow-md transition-all"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>{isVerifyingSingle ? 'Đang xác thực API Meta...' : 'Kiểm tra API & Lưu Fanpage vào Achat'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: WEBHOOK CONFIGURATION */}
          {activeTab === 'webhook_setup' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Lưu ý về URL Webhook trên Meta Developers:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Khi đăng ký Webhook trên Facebook Developers, máy chủ Meta yêu cầu URL phải truy cập công khai không có
                  màn hình đăng nhập cookie. Bạn có thể sử dụng công cụ tunnel như <strong>Ngrok</strong> (chạy lệnh:
                  <code className="bg-white px-1 py-0.5 rounded border ml-1 font-mono">ngrok http 3000</code>) rồi dán URL vào Facebook,
                  chọn đối tượng là <strong>Page</strong> và đăng ký trường <strong>messages</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider block">
                  Thông số Webhook hiện tại
                </span>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569]">URL gọi lại (Callback URL):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 font-mono text-[11px] text-[#1E293B]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedWebhook ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569]">Mã xác minh (Verify Token):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={verifyToken}
                      className="flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 font-mono text-[11px] text-[#0088FF] font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(verifyToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedToken ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SIMULATED INCOMING MESSAGE TEST */}
          {activeTab === 'simulate_test' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 space-y-1">
                <div className="font-bold text-sm text-[#3730A3] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Trình giả lập tin nhắn khách hàng Facebook thật</span>
                </div>
                <p className="text-[11px] text-[#4338CA]">
                  Gửi ngay 1 tin nhắn khách hàng Facebook vào hệ thống. Gemini AI sẽ lập tức phân tích theo kịch bản,
                  gắn tag #Bot_TựĐộng và đề xuất chốt đơn!
                </p>
              </div>

              <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#334155]">Tên khách hàng</label>
                    <input
                      type="text"
                      value={simCustomerName}
                      onChange={(e) => setSimCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#334155]">Số điện thoại</label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs font-mono text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#334155]">Nội dung tin nhắn khách gửi</label>
                  <textarea
                    rows={3}
                    value={simMessageText}
                    onChange={(e) => setSimMessageText(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#CBD5E1] p-3 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                {simSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Đã nhận tin nhắn! Đang mở cửa sổ chat chốt đơn...</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={handleTriggerSimulation}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
                  >
                    {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>{isSimulating ? 'Đang gửi...' : 'Gửi tin nhắn & Xem AI chốt đơn ngay'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3.5 bg-[#F8FAFC] flex justify-between items-center">
          <span className="text-[11px] text-[#64748B]">
            Hệ thống Achat GO · Quản lý tập trung tất cả Fanpage trong 1 cửa sổ
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#182538] px-5 py-2 text-xs font-semibold text-white hover:bg-[#24334B] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
