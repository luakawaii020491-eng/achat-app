import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  ShoppingCart,
  Sparkles,
  ChevronDown,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  Plus,
  Tag,
  ExternalLink,
  RotateCw,
  HelpCircle,
  Headphones,
  Check,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Truck,
  Layers,
  Settings,
  Bot,
  Loader2,
  Wand2,
  BrainCircuit,
  Users,
  CheckCircle2,
  Clock,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import {
  Conversation,
  Customer,
  Fanpage,
  HashtagLabel,
  Order,
  OrderStatus,
  Product,
  ShippingCarrier,
  StaffMember,
  AiStoreSettings,
  QuickReplyTemplate,
} from '../types';
import { formatVND, getStatusBadge, ORDER_STATUS_TAG_MAP } from '../utils/formatters';
import { DockedOrderCreationPanel } from './DockedOrderCreationPanel';
import AIAssistantPanel from './AIAssistantPanel';

interface SocialChannelViewProps {
  fanpages: Fanpage[];
  conversations: Conversation[];
  hashtags: HashtagLabel[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  staffList?: StaffMember[];
  currentStaff?: StaffMember;
  aiSettings?: AiStoreSettings;
  carriers?: ShippingCarrier[];
  quickReplies?: QuickReplyTemplate[];
  onOpenQuickRepliesModal?: () => void;
  onDirectCreateOrder?: (order: Order, printImmediately?: boolean) => void;
  activeBranch?: string;
  onOpenCreateOrderWithData: (initialData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    sourcePageName: string;
    selectedSku?: string;
    quantity?: number;
  }) => void;
  onUpdateConversation: (updated: Conversation) => void;
  onOpenHashtagManager: () => void;
  onOpenFanpageSettings: () => void;
  onOpenShippingCarriers?: () => void;
  onOpenStaffManagement?: () => void;
  onOpenAiTraining?: (productId?: string) => void;
  onSyncPageMessages?: (pageId: string) => Promise<void> | void;
  onGenerateSampleChatsForPage?: (pageId: string) => void;
}

export const SocialChannelView: React.FC<SocialChannelViewProps> = ({
  fanpages,
  conversations,
  hashtags,
  products,
  customers,
  orders,
  staffList = [],
  currentStaff,
  aiSettings,
  carriers = [],
  quickReplies = [],
  onOpenQuickRepliesModal,
  onDirectCreateOrder,
  activeBranch = 'Kho Tổng - TP. Hồ Chí Minh',
  onOpenCreateOrderWithData,
  onUpdateConversation,
  onOpenHashtagManager,
  onOpenFanpageSettings,
  onOpenShippingCarriers,
  onOpenStaffManagement,
  onOpenAiTraining,
  onSyncPageMessages,
  onGenerateSampleChatsForPage,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    conversations[0]?.id || 'conv-1'
  );
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'comments'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<'all' | 'mine' | 'unassigned' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [chatLayoutMode, setChatLayoutMode] = useState<'balanced' | 'wide' | 'fullscreen'>('wide');
  const [rightTab, setRightTab] = useState<'create_order' | 'orders' | 'notes' | 'customer'>('create_order');
  const [showProductPickerForChat, setShowProductPickerForChat] = useState(false);
  const [showQuickReplyMenu, setShowQuickReplyMenu] = useState(false);
  const [quickReplySelectedIndex, setQuickReplySelectedIndex] = useState(0);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // AI Assistant State (Gemini 3.8 Flash, ChatGPT, Muse)
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(aiSettings?.isAutoPilotEnabled ?? true);
  const [aiOrderProposal, setAiOrderProposal] = useState<{
    isOrderReady: boolean;
    confidenceScore: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    matchedSku: string;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
    suggestedSalesReply: string;
    orderNote: string;
  } | null>(null);

  // Quick replies trigger when typing / or #
  const isTypingQuickReply = messageInput.startsWith('/') || messageInput.startsWith('#') || messageInput.includes(' /') || messageInput.includes(' #');
  const quickQuery = isTypingQuickReply ? messageInput.replace(/^.*?[\/#]/, '').toLowerCase().trim() : '';

  const matchingQuickReplies = isTypingQuickReply
    ? quickReplies.filter(
        (q) =>
          !quickQuery ||
          q.shortcut.toLowerCase().includes(quickQuery) ||
          q.title.toLowerCase().includes(quickQuery) ||
          q.content.toLowerCase().includes(quickQuery)
      )
    : [];

  const handleSelectQuickReplyTemplate = (template: QuickReplyTemplate) => {
    const interpolated = template.content
      .replace(/\{ten_khach\}|\{ten\}|\{khach\}/gi, activeConversation?.customerName || 'bạn')
      .replace(/\{so_dien_thoai\}|\{sdt\}|\{phone\}/gi, activeConversation?.customerPhone || '0916636785')
      .replace(/\{dia_chi\}|\{diachi\}/gi, activeConversation?.customerAddress || 'Hà Nội')
      .replace(/\{stk\}|\{ngan_hang\}/gi, 'Techcombank: 19036888999999 - NGUYEN VAN THANG')
      .replace(/\{hotline\}/gi, '0916636785');

    setMessageInput(interpolated);
    setQuickReplySelectedIndex(0);
  };

  // Multi-key flexible conversation filter (Supports Merged All Pages, Single Pages, and Staff Assignment)
  const filteredConversations = conversations.filter((c) => {
    // 1. Page filter
    if (selectedPageId !== 'all') {
      const pageObj = fanpages.find((p) => p.id === selectedPageId || p.pageId === selectedPageId);
      const cleanSelected = selectedPageId.replace(/^page-/, '');
      const cleanConvPageId = c.pageId.replace(/^page-/, '');

      const matchesId =
        c.pageId === selectedPageId ||
        cleanConvPageId === cleanSelected ||
        (pageObj && (c.pageId === pageObj.pageId || c.pageId === pageObj.id));

      const matchesName = Boolean(
        pageObj &&
        c.pageName &&
        (c.pageName.toLowerCase().trim() === pageObj.name.toLowerCase().trim() ||
          pageObj.name.toLowerCase().includes(c.pageName.toLowerCase()) ||
          c.pageName.toLowerCase().includes(pageObj.name.toLowerCase()))
      );

      if (!matchesId && !matchesName) return false;
    }

    // 2. Tab filter (message vs comment)
    if (activeTab === 'messages' && c.type !== 'message') return false;
    if (activeTab === 'comments' && c.type !== 'comment') return false;

    // 3. Hashtag status filter
    if (selectedTagFilter !== 'all') {
      if (!c.tags?.includes(selectedTagFilter)) return false;
    }

    // 4. Staff assignment filter (Phân chia hội thoại cho từng nhân viên)
    if (staffFilter === 'mine') {
      if (!currentStaff || c.assignedStaffId !== currentStaff.id) return false;
    } else if (staffFilter === 'unassigned') {
      if (c.assignedStaffId) return false;
    } else if (staffFilter !== 'all') {
      if (c.assignedStaffId !== staffFilter) return false;
    }

    // 5. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.customerName.toLowerCase().includes(q);
      const matchPhone = c.customerPhone?.includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMsg) return false;
    }

    return true;
  });

  // Active conversation - fallback to first filtered if exists
  const activeConversation =
    filteredConversations.find((c) => c.id === selectedConversationId) ||
    filteredConversations[0] ||
    conversations[0];

  // Auto select first filtered conversation when filter changes
  React.useEffect(() => {
    if (filteredConversations.length > 0) {
      const isCurrentInFiltered = filteredConversations.some((c) => c.id === selectedConversationId);
      if (!isCurrentInFiltered) {
        setSelectedConversationId(filteredConversations[0].id);
        setAiOrderProposal(null);
      }
    }
  }, [selectedPageId, selectedTagFilter, filteredConversations.length]);

  // Handle manual sync click
  const handleSyncClick = async () => {
    if (!onSyncPageMessages) return;
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      await onSyncPageMessages(selectedPageId);
      const targetName =
        selectedPageId === 'all'
          ? 'Tất cả các Page'
          : fanpages.find((p) => p.id === selectedPageId || p.pageId === selectedPageId)?.name || 'Fanpage';
      setSyncNotice(`Đã đồng bộ tin nhắn mới từ ${targetName}!`);
      setTimeout(() => setSyncNotice(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle sending message
  // RULE (Theo yêu cầu):
  // "phần hastag nếu bạn tương tác với khách thì để hastag tự động còn nhân viên tư vấn thì không cần;
  //  đơn hàng ở trạng thái nào thì đặt hastag ở trạng thái đó; đơn cần xác nhận; đã chốt; đã lên đơn; đã đẩy vận chuyển ..."
  const handleSendMessage = (textToSend?: string, isFromBot = false, attachedImage?: string) => {
    const text = (textToSend || messageInput).trim();
    if ((!text && !attachedImage) || !activeConversation) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'shop' as const,
      text: text || 'Đã gửi hình ảnh sản phẩm',
      image: attachedImage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    let newTags = activeConversation.tags || [];

    if (isFromBot) {
      // Automatic Bot reply: add tag #Bot_TựĐộng
      if (!newTags.includes('tag-bot-tu-dong')) {
        newTags = [...newTags, 'tag-bot-tu-dong'];
      }
      newTags = newTags.filter((t) => t !== 'tag-nv-tu-van');
    } else {
      // Consultant / Human response: remove bot tag and add #NV_TưVấn
      newTags = newTags.filter((t) => t !== 'tag-bot-tu-dong');
      if (!newTags.includes('tag-nv-tu-van')) {
        newTags = [...newTags, 'tag-nv-tu-van'];
      }
    }

    const updated: Conversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMsg],
      lastMessage: text || '[Hình ảnh]',
      lastMessageTime: newMsg.time,
      tags: newTags,
      autoRepliedByBot: isFromBot,
      assignedStaffName: isFromBot ? activeConversation.assignedStaffName : (currentStaff?.name || 'Lê Hoàng Nam'),
    };

    onUpdateConversation(updated);
    setMessageInput('');
  };

  // Toggle hashtag on current conversation
  const handleToggleTag = (tagId: string) => {
    if (!activeConversation) return;
    const currentTags = activeConversation.tags || [];
    const updatedTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];

    onUpdateConversation({
      ...activeConversation,
      tags: updatedTags,
    });
  };

  // Assign staff to current conversation
  const handleAssignStaff = (staffMember: StaffMember) => {
    if (!activeConversation) return;
    onUpdateConversation({
      ...activeConversation,
      assignedStaffId: staffMember.id,
      assignedStaffName: staffMember.name,
    });
  };

  // Trigger Gemini AI Auto-Close Order
  const handleTriggerAiCloseOrder = async () => {
    if (!activeConversation) return;
    setIsAiThinking(true);
    setAiOrderProposal(null);

    try {
      const targetScript = aiSettings?.productScripts
        ? Object.values(aiSettings.productScripts)[0]
        : undefined;

      const res = await fetch('/api/ai/close-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: activeConversation.messages,
          availableProducts: products,
          customerInfo: {
            name: activeConversation.customerName,
            phone: activeConversation.customerPhone,
          },
          aiTrainingConfig: aiSettings,
          targetProductScript: targetScript,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiOrderProposal(data.data);

        // If auto-pilot is on and order is ready: auto-reply and tag bot!
        if (isAutoPilotActive && data.data.suggestedSalesReply) {
          // Let user see proposed response or auto send
        }
      }
    } catch (err) {
      console.error('Failed to call AI close order:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Trigger Gemini AI Smart Reply using Machine Learning trained script
  const handleTriggerAiSmartReply = async (autoSend = false) => {
    if (!activeConversation) return;
    setIsAiThinking(true);

    try {
      // Find matching product script
      const targetScript = aiSettings?.productScripts
        ? Object.values(aiSettings.productScripts)[0]
        : undefined;

      const res = await fetch('/api/ai/chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: activeConversation.messages,
          storeName: activeConversation.pageName || 'Achat Shop',
          availableProducts: products,
          aiTrainingConfig: aiSettings,
          targetProductScript: targetScript,
        }),
      });

      const data = await res.json();
      if (data.success && data.replyText) {
        if (autoSend) {
          handleSendMessage(data.replyText, true); // Send as Bot
        } else {
          setMessageInput(data.replyText);
        }
      }
    } catch (err) {
      console.error('Failed to get AI reply:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Auto distribute conversations among available staff
  const handleAutoDistributeConversations = () => {
    const activeStaff = staffList.filter((s) => s.isOnline && s.role !== 'warehouse');
    const targetPool = activeStaff.length > 0 ? activeStaff : staffList.filter((s) => s.role !== 'warehouse');

    if (targetPool.length === 0) {
      setSyncNotice('Không có nhân viên nào phù hợp để chia hội thoại!');
      setTimeout(() => setSyncNotice(null), 3000);
      return;
    }

    let idx = 0;
    conversations.forEach((conv) => {
      const assigned = targetPool[idx % targetPool.length];
      idx++;
      onUpdateConversation({
        ...conv,
        assignedStaffId: assigned.id,
        assignedStaffName: assigned.name,
      });
    });

    setSyncNotice(
      `⚡ Đã chia đều ${conversations.length} cuộc hội thoại cho ${targetPool.length} nhân viên (${targetPool
        .map((s) => s.name.split(' ').slice(-1)[0])
        .join(', ')})!`
    );
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // Reassign single conversation
  const handleAssignConversation = (convId: string, staffId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    if (!staffId || staffId === 'unassigned') {
      onUpdateConversation({
        ...conv,
        assignedStaffId: undefined,
        assignedStaffName: undefined,
      });
      setSyncNotice(`Đã chuyển hội thoại của ${conv.customerName} về Chưa phân công`);
    } else {
      const staff = staffList.find((s) => s.id === staffId);
      if (!staff) return;
      onUpdateConversation({
        ...conv,
        assignedStaffId: staff.id,
        assignedStaffName: staff.name,
      });
      setSyncNotice(`Đã phân công hội thoại cho nhân viên: ${staff.name}`);
    }
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Quick close order from chat
  const handleTriggerCreateOrder = (customData?: any) => {
    if (!activeConversation) return;
    onOpenCreateOrderWithData({
      customerName: customData?.customerName || activeConversation.customerName,
      customerPhone: customData?.customerPhone || activeConversation.customerPhone || '',
      customerAddress: customData?.customerAddress || activeConversation.customerAddress || '',
      sourcePageName: activeConversation.pageName,
      selectedSku: customData?.matchedSku,
      quantity: customData?.quantity || 1,
    });
  };

  // Active customer orders
  const customerOrders = orders.filter(
    (o) =>
      o.customer.phone === activeConversation?.customerPhone ||
      o.customer.name.toLowerCase() === activeConversation?.customerName.toLowerCase()
  );

  return (
    <div className="flex h-[calc(100vh-4.5rem)] w-full rounded-xl border border-[#CBD5E1] bg-white shadow-xs overflow-hidden select-none">
      {/* ========================================================
          COLUMN 1: CONVERSATIONS LIST (Achat Social Left Column)
         ======================================================== */}
      {showLeftSidebar && (
        <div className={`${chatLayoutMode === 'wide' ? 'w-72' : chatLayoutMode === 'fullscreen' ? 'w-60' : 'w-80 lg:w-88'} flex flex-col border-r border-[#E2E8F0] bg-white shrink-0 transition-all`}>
          {/* Top Page Selector */}
          <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-[#0088FF]" />
                Hội thoại Fanpage
              </span>
            <button
              onClick={onOpenFanpageSettings}
              className="text-[11px] text-[#0088FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Settings className="h-3 w-3" />
              <span>Kết nối Facebook</span>
            </button>
          </div>

          {/* Achat Page Dropdown (Supports Merged All Pages with Follower Count!) */}
          <div className="relative">
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F172A] shadow-2xs outline-none focus:border-[#0088FF] cursor-pointer"
            >
              <option value="all">
                🌐 TẤT CẢ CÁC TRANG (Gộp {fanpages.length} Pages · {fanpages.reduce((sum, p) => sum + p.followersCount, 0).toLocaleString('vi-VN')} người theo dõi)
              </option>
              {fanpages.map((p) => (
                <option key={p.id} value={p.id}>
                  📄 {p.name} ({p.followersCount.toLocaleString('vi-VN')} theo dõi)
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#64748B] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Quick sync & count row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0]">
            <div className="text-[10px] text-[#64748B] font-medium flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{filteredConversations.length} hội thoại hiển thị</span>
            </div>
            <button
              type="button"
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1 text-[11px] font-bold text-[#0088FF] hover:text-[#0066CC] hover:underline cursor-pointer"
            >
              <RotateCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang tải...' : 'Tải lại tin nhắn (F5)'}</span>
            </button>
          </div>

          {syncNotice && (
            <div className="mt-2 p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-medium flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>{syncNotice}</span>
            </div>
          )}
        </div>

        {/* Filter Tabs: Tất cả, Tin nhắn, Bình luận */}
        <div className="flex items-center border-b border-[#E2E8F0] px-2 pt-1.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#0088FF] text-[#0088FF] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>Tất cả</span>
            <span className="rounded-full bg-blue-100 text-[#0088FF] text-[10px] px-1.5 py-0.2 font-mono font-bold">
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'messages'
                ? 'border-[#0088FF] text-[#0088FF] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>Tin nhắn</span>
            <span className="rounded-full bg-rose-500 text-white text-[10px] px-1.5 py-0.2 font-mono">
              {conversations.filter((c) => c.type === 'message').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'comments'
                ? 'border-[#0088FF] text-[#0088FF] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>Bình luận</span>
            <span className="rounded-full bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 font-mono">
              {conversations.filter((c) => c.type === 'comment').length}
            </span>
          </button>
        </div>

        {/* Staff Assignment & Distribution Bar (Phân chia hội thoại cho từng nhân viên) */}
        <div className="px-2.5 py-1.5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between gap-1.5 text-[11px]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="text-slate-500 font-semibold shrink-0">Phân công:</span>
            <button
              onClick={() => setStaffFilter('all')}
              className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                staffFilter === 'all' ? 'bg-[#0088FF] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStaffFilter('mine')}
              className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                staffFilter === 'mine' ? 'bg-[#0088FF] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Của tôi</span>
              <span className={`font-mono text-[9px] px-1 rounded ${staffFilter === 'mine' ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {conversations.filter((c) => c.assignedStaffId === currentStaff?.id).length}
              </span>
            </button>
            <button
              onClick={() => setStaffFilter('unassigned')}
              className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                staffFilter === 'unassigned' ? 'bg-[#0088FF] text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Chưa chia</span>
              <span className={`font-mono text-[9px] px-1 rounded ${staffFilter === 'unassigned' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {conversations.filter((c) => !c.assignedStaffId).length}
              </span>
            </button>
          </div>

          <button
            onClick={handleAutoDistributeConversations}
            className="flex items-center gap-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 px-2 py-0.5 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
            title="Tự động chia đều tất cả các cuộc hội thoại cho các nhân viên đang trực tuyến"
          >
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>Chia đều</span>
          </button>
        </div>

        {/* Search Bar (F3) */}
        <div className="p-2 border-b border-[#F1F5F9] flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs text-[#0F172A]">
            <Search className="h-3.5 w-3.5 text-[#94A3B8] mr-2" />
            <input
              type="text"
              placeholder="Tìm khách hàng, SĐT, tin nhắn (F3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Quick Hashtag Filter Pills (Chuẩn trạng thái đơn & bot) */}
        <div className="px-2.5 py-1.5 border-b border-[#F1F5F9] bg-[#F8FAFC]/70 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedTagFilter('all')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
              selectedTagFilter === 'all'
                ? 'bg-[#0088FF] text-white'
                : 'bg-white border border-[#CBD5E1] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>

          <button
            onClick={() => setSelectedTagFilter('tag-don-can-xac-nhan')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
              selectedTagFilter === 'tag-don-can-xac-nhan'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            #ĐơnCầnXácNhận
          </button>

          <button
            onClick={() => setSelectedTagFilter('tag-da-chot')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
              selectedTagFilter === 'tag-da-chot'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            #ĐãChốt
          </button>

          <button
            onClick={() => setSelectedTagFilter('tag-da-len-don')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
              selectedTagFilter === 'tag-da-len-don'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            #ĐãLênĐơn
          </button>

          <button
            onClick={() => setSelectedTagFilter('tag-da-day-vc')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
              selectedTagFilter === 'tag-da-day-vc'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            #ĐãĐẩyVậnChuyển
          </button>

          <button
            onClick={() => setSelectedTagFilter('tag-bot-tu-dong')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
              selectedTagFilter === 'tag-bot-tu-dong'
                ? 'bg-violet-600 text-white'
                : 'bg-violet-50 text-violet-800 border border-violet-200'
            }`}
          >
            #Bot_TựĐộng
          </button>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConversation?.id;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversationId(conv.id);
                  setAiOrderProposal(null);
                }}
                className={`p-3 cursor-pointer transition-colors relative ${
                  isSelected ? 'bg-[#F0F7FF] border-l-4 border-l-[#0088FF]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Customer Avatar */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0 ${conv.customerAvatarColor}`}
                  >
                    {conv.customerAvatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A] truncate">
                        {conv.customerName}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono shrink-0 ml-1">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {/* Source Fanpage Badge */}
                    <div className="text-[10px] text-[#0088FF] font-semibold truncate flex items-center gap-1 mt-0.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>{conv.pageName}</span>
                    </div>

                    {/* Last message text preview */}
                    <p className="text-[11px] text-[#475569] truncate mt-1">
                      {conv.lastMessage}
                    </p>

                    {/* Hashtags & indicators */}
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      {conv.hasPhone && (
                        <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" />
                          <span>Có SĐT</span>
                        </span>
                      )}

                      {conv.hasOrder && (
                        <span className="rounded bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 flex items-center gap-0.5">
                          <ShoppingCart className="h-2.5 w-2.5" />
                          <span>Đã lên đơn</span>
                        </span>
                      )}

                      {conv.autoRepliedByBot && (
                        <span className="rounded bg-violet-50 border border-violet-200 text-violet-700 text-[9px] font-bold px-1.5 py-0.2 flex items-center gap-0.5">
                          <Bot className="h-2.5 w-2.5" />
                          <span>Bot tự động</span>
                        </span>
                      )}

                      {conv.tags?.slice(0, 2).map((tagId) => {
                        const h = hashtags.find((tag) => tag.id === tagId);
                        if (!h) return null;
                        return (
                          <span
                            key={h.id}
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${h.bgColor} ${h.textColor}`}
                          >
                            {h.name}
                          </span>
                        );
                      })}

                      {/* Assigned staff badge */}
                      {conv.assignedStaffName ? (
                        <span className="rounded bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-semibold px-1.5 py-0.2 flex items-center gap-1">
                          <UserCheck className="h-2.5 w-2.5 text-blue-600" />
                          <span>{conv.assignedStaffName.split(' ').slice(-1)[0]}</span>
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-medium px-1.5 py-0.2">
                          Chưa chia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state when no conversations */}
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0088FF]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#0F172A]">Chưa có cuộc hội thoại nào</div>
                <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                  Trang này chưa có tin nhắn hoặc bộ lọc không khớp. Hãy tải lại tin nhắn từ Facebook hoặc nạp hội thoại mẫu.
                </p>
              </div>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSyncClick}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-bold text-white hover:bg-[#0077E6] shadow-xs cursor-pointer"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang tải...' : 'Tải tin nhắn từ Facebook'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* ========================================================
          COLUMN 2: MIDDLE CHAT WINDOW (Conversation Dialogue)
         ======================================================== */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#F8FAFC] border-r border-[#E2E8F0] min-w-0">
          {/* Chat Customer Header */}
          <div className="h-14 border-b border-[#E2E8F0] bg-white px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Toggle Left Sidebar Button */}
              <button
                type="button"
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  !showLeftSidebar
                    ? 'bg-blue-50 text-[#0088FF] border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
                title={showLeftSidebar ? 'Thu gọn danh sách khách (Mở rộng chat)' : 'Mở lại danh sách khách'}
              >
                <Users className="h-4 w-4" />
              </button>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold ${activeConversation.customerAvatarColor}`}
              >
                {activeConversation.customerAvatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {activeConversation.customerName}
                  </span>
                  <span className="text-[#0088FF] text-[11px] hover:underline cursor-pointer">
                    Trang cá nhân
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <span>Trang: <strong className="text-blue-700">{activeConversation.pageName}</strong></span>
                  {activeConversation.customerPhone && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {activeConversation.customerPhone}
                      </span>
                    </>
                  )}
                  {activeConversation.assignedStaffName && (
                    <>
                      <span>·</span>
                      <span className="text-[#475569] flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-emerald-600" />
                        {activeConversation.assignedStaffName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top action shortcuts: Reassign Staff, AI Training, Carriers, Layout Customizer */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Conversation Staff Reassignment Dropdown */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                <Users className="h-3.5 w-3.5 text-[#0088FF]" />
                <span className="text-[11px] text-slate-600 font-medium">Phân công:</span>
                <select
                  value={activeConversation.assignedStaffId || 'unassigned'}
                  onChange={(e) => handleAssignConversation(activeConversation.id, e.target.value)}
                  className="bg-transparent font-bold text-xs text-[#0F172A] outline-none cursor-pointer max-w-36 truncate"
                >
                  <option value="unassigned">⚠️ Chưa phân công</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chat Window Width Customizer (user's explicit requirement: "làm cửa sổ ở giữa khu vực trả lời khách hàng rộng ra một chút hoặc tuỳ biến") */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setChatLayoutMode('balanced');
                    setShowLeftSidebar(true);
                    setShowRightSidebar(true);
                  }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    chatLayoutMode === 'balanced'
                      ? 'bg-white text-[#0088FF] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Bố cục 3 cột cân đối"
                >
                  Cân đối
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatLayoutMode('wide');
                    setShowLeftSidebar(true);
                    setShowRightSidebar(true);
                  }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    chatLayoutMode === 'wide'
                      ? 'bg-white text-[#0088FF] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Mở rộng cửa sổ chat ở giữa"
                >
                  Chat Rộng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatLayoutMode('fullscreen');
                    setShowLeftSidebar(false);
                    setShowRightSidebar(false);
                  }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    chatLayoutMode === 'fullscreen'
                      ? 'bg-white text-[#0088FF] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Toàn màn hình chat"
                >
                  Toàn màn
                </button>
              </div>

              {/* AI Auto-pilot Status Indicator */}
              <button
                type="button"
                onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                className={`hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold border transition-all cursor-pointer ${
                  isAutoPilotActive
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-slate-300 bg-slate-100 text-slate-600'
                }`}
                title="Bật/Tắt chế độ máy học AI tự động trả lời"
              >
                <Bot className="h-3.5 w-3.5 text-purple-600" />
                <span>{isAutoPilotActive ? 'AI Kịch bản: BẬT' : 'AI Kịch bản: TẮT'}</span>
              </button>

              {/* AI AUTO CLOSE ORDER BUTTON */}
              <button
                onClick={handleTriggerAiCloseOrder}
                disabled={isAiThinking}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-[#0088FF] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                {isAiThinking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                <span>AI Chốt đơn</span>
              </button>

              {/* Toggle Right Order Sidebar Button */}
              <button
                type="button"
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showRightSidebar
                    ? 'bg-blue-50 text-[#0088FF] border-blue-300 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
                title={showRightSidebar ? 'Thu gọn cột lên đơn (Mở rộng chat tối đa)' : 'Hiện cột lên đơn & thông tin khách'}
              >
                <Layers className="h-4 w-4" />
              </button>
            </div>
          </div>



          {/* AI Order Proposal Banner (When Gemini analyzes the conversation) */}
          {aiOrderProposal && (
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-b border-indigo-200 p-3.5 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-purple-900">
                        Gemini AI đã phân tích theo kịch bản &amp; trích xuất đơn hàng:
                      </span>
                      <span className="rounded bg-emerald-100 border border-emerald-300 px-1.5 text-[10px] font-bold text-emerald-800">
                        Độ tin cậy: {aiOrderProposal.confidenceScore}%
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-[#334155] flex-wrap">
                      <span>Khách: <strong>{aiOrderProposal.customerName}</strong></span>
                      {aiOrderProposal.customerPhone && (
                        <span>SĐT: <strong className="font-mono text-emerald-700">{aiOrderProposal.customerPhone}</strong></span>
                      )}
                      {aiOrderProposal.matchedSku && (
                        <span>Mã SKU: <strong className="font-mono text-[#0088FF]">{aiOrderProposal.matchedSku}</strong></span>
                      )}
                      {aiOrderProposal.selectedSize && (
                        <span>Size: <strong>{aiOrderProposal.selectedSize}</strong></span>
                      )}
                      {aiOrderProposal.selectedColor && (
                        <span>Màu: <strong>{aiOrderProposal.selectedColor}</strong></span>
                      )}
                    </div>

                    {aiOrderProposal.suggestedSalesReply && (
                      <div className="mt-2 text-[11px] text-purple-950 bg-white/80 p-2 rounded-md border border-purple-200">
                        <strong>Câu chốt đơn gợi ý (kịch bản AI):</strong> &quot;{aiOrderProposal.suggestedSalesReply}&quot;
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTriggerCreateOrder(aiOrderProposal)}
                    className="rounded-lg bg-[#0088FF] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0077E6] shadow-xs cursor-pointer"
                  >
                    Duyệt &amp; Lên đơn ngay
                  </button>
                  <button
                    onClick={() => handleSendMessage(aiOrderProposal.suggestedSalesReply, true)}
                    className="rounded-lg bg-white border border-purple-300 px-3 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer"
                  >
                    Gửi câu chốt (Bot)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversation.messages.map((msg) => {
              const isShop = msg.sender === 'shop';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isShop ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-2xs leading-relaxed ${
                      isShop
                        ? 'bg-[#0088FF] text-white rounded-br-xs'
                        : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-xs'
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Product"
                        className="rounded-lg mb-2 max-h-48 object-cover border border-white/20"
                      />
                    )}

                    <div className="whitespace-pre-line font-medium">{msg.text}</div>

                    {msg.isPhoneExtracted && (
                      <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-emerald-900">
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          <span>Đã phát hiện SĐT: {activeConversation.customerPhone}</span>
                        </div>
                        <button
                          onClick={() => handleTriggerCreateOrder()}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                        >
                          Lên đơn ngay
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-[#94A3B8] font-mono mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ACHAT HASHTAG / LABEL BAR */}
          <div className="border-t border-[#E2E8F0] bg-white px-3 py-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Tag className="h-3 w-3 text-[#0088FF]" />
                Nhãn:
              </span>

              {hashtags.map((h) => {
                const isApplied = activeConversation.tags?.includes(h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => handleToggleTag(h.id)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                      isApplied
                        ? `${h.bgColor} ${h.textColor} border border-current shadow-2xs`
                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${h.color}`} />
                    <span>{h.name}</span>
                    {isApplied && <Check className="h-3 w-3" />}
                  </button>
                );
              })}

              <button
                onClick={onOpenHashtagManager}
                className="flex items-center gap-1 rounded-full border border-dashed border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0088FF] hover:bg-[#F0F7FF] shrink-0 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Quản lý nhãn</span>
              </button>
            </div>
          </div>

          {/* Input Bar & Prominent Buttons */}
          <div className="border-t border-[#E2E8F0] bg-white p-3 relative">
            {/* FLOATING QUICK REPLIES AUTOCOMPLETE POPUP (When typing / or #) */}
            {isTypingQuickReply && matchingQuickReplies.length > 0 && (
              <div className="absolute left-3 right-3 bottom-full mb-2 max-h-72 overflow-y-auto rounded-xl border border-blue-300 bg-white shadow-2xl z-50 divide-y divide-slate-100 animate-fadeIn">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 flex items-center justify-between border-b border-blue-200">
                  <span className="font-bold text-[11px] text-[#0088FF] flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-[#0088FF]" />
                    <span>Gợi ý câu trả lời mẫu ({matchingQuickReplies.length}) · Phím tắt: Gõ &quot;/&quot; hoặc &quot;#&quot;</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Dùng phím ↑ ↓ để chọn, Enter để điền
                  </span>
                </div>

                <div className="p-1 space-y-0.5">
                  {matchingQuickReplies.map((qr, idx) => {
                    const isSelected = idx === quickReplySelectedIndex;
                    return (
                      <div
                        key={qr.id}
                        onClick={() => handleSelectQuickReplyTemplate(qr)}
                        className={`flex items-start justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/90 border border-blue-300 text-slate-900'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#0088FF]">
                              {qr.shortcut}
                            </span>
                            <span className="font-bold text-xs text-[#0F172A] truncate">
                              {qr.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#475569] line-clamp-2 mt-0.5 leading-snug">
                            {qr.content
                              .replace(/\{ten_khach\}|\{ten\}/gi, activeConversation?.customerName || 'chị')
                              .replace(/\{so_dien_thoai\}|\{sdt\}/gi, activeConversation?.customerPhone || '...')
                              .replace(/\{dia_chi\}/gi, activeConversation?.customerAddress || '...')}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="shrink-0 rounded bg-white border border-blue-200 px-2 py-1 text-[10px] font-bold text-[#0088FF] hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Chọn
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Template Fast-Action Pills Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-[10px] font-bold text-[#64748B] shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Mẫu nhanh:</span>
              </span>

              {quickReplies.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectQuickReplyTemplate(t)}
                  className="rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-[#0088FF] transition-colors cursor-pointer shrink-0 truncate max-w-[150px]"
                  title={t.title}
                >
                  <strong className="font-mono">{t.shortcut}</strong> {t.title.split(' ')[0]}
                </button>
              ))}

              {onOpenQuickRepliesModal && (
                <button
                  type="button"
                  onClick={onOpenQuickRepliesModal}
                  className="rounded-full border border-dashed border-slate-300 bg-white hover:bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 cursor-pointer shrink-0"
                >
                  + Tất cả mẫu câu
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isTypingQuickReply && matchingQuickReplies.length > 0) {
                  handleSelectQuickReplyTemplate(matchingQuickReplies[quickReplySelectedIndex] || matchingQuickReplies[0]);
                  return;
                }
                handleSendMessage(undefined, false); // Consultant sent -> no bot tag!
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Gõ &quot;/&quot; để chọn câu trả lời mẫu, #nhãn, hoặc nhập tin nhắn tư vấn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (isTypingQuickReply && matchingQuickReplies.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setQuickReplySelectedIndex((prev) => (prev + 1) % matchingQuickReplies.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setQuickReplySelectedIndex((prev) => (prev - 1 + matchingQuickReplies.length) % matchingQuickReplies.length);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectQuickReplyTemplate(matchingQuickReplies[quickReplySelectedIndex] || matchingQuickReplies[0]);
                      } else if (e.key === 'Escape') {
                        setMessageInput('');
                      }
                    }
                  }}
                  className="flex-1 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:bg-white focus:ring-1 focus:ring-[#0088FF]"
                />

                {/* AI Smart Reply trigger button */}
                <button
                  type="button"
                  onClick={() => handleTriggerAiSmartReply(false)}
                  disabled={isAiThinking}
                  className="flex items-center gap-1 rounded-xl border border-purple-300 bg-purple-50 px-2.5 py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors shrink-0 cursor-pointer"
                  title="Gợi ý câu trả lời AI theo kịch bản"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span className="hidden sm:inline">AI gợi ý</span>
                </button>

                {/* Auto Send as Bot */}
                <button
                  type="button"
                  onClick={() => handleTriggerAiSmartReply(true)}
                  disabled={isAiThinking}
                  className="flex items-center gap-1 rounded-xl border border-violet-300 bg-violet-600 px-2.5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors shrink-0 cursor-pointer"
                  title="AI tự động trả lời và gắn tag #Bot_TựĐộng"
                >
                  <Bot className="h-3.5 w-3.5 text-white" />
                  <span className="hidden sm:inline">Bot gửi</span>
                </button>

                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0088FF] text-white hover:bg-[#0077E6] transition-colors shrink-0 cursor-pointer shadow-xs"
                  title="Gửi tin nhắn"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Shortcuts Toolbar, Quick Replies & Achat Prominent Button */}
              <div className="flex items-center justify-between text-[11px] text-[#64748B] flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Canned Responses Open Button */}
                  {onOpenQuickRepliesModal && (
                    <button
                      type="button"
                      onClick={onOpenQuickRepliesModal}
                      className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] font-bold text-[#0088FF] hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Mở thư viện câu trả lời mẫu cho nhân viên"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Câu trả lời mẫu (/)</span>
                    </button>
                  )}

                  {/* Send Product Image into Chat */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowProductPickerForChat(!showProductPickerForChat)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Gửi ảnh sản phẩm trực tiếp vào inbox khách hàng"
                    >
                      <ImageIcon className="h-3 w-3 text-emerald-600" />
                      <span>Gửi ảnh SP</span>
                    </button>

                    {showProductPickerForChat && (
                      <div className="absolute left-0 bottom-full mb-2 w-72 max-h-64 overflow-y-auto rounded-xl border border-[#CBD5E1] bg-white shadow-2xl z-40 p-2 space-y-1.5">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <span className="font-bold text-xs text-[#0F172A]">Chọn SP gửi ảnh vào inbox:</span>
                          <button
                            type="button"
                            onClick={() => setShowProductPickerForChat(false)}
                            className="text-slate-400 hover:text-slate-600 font-bold"
                          >
                            ×
                          </button>
                        </div>
                        {products.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              handleSendMessage(
                                `Dạ em gửi chị ảnh thật sản phẩm: ${p.name} (SKU: ${p.variants[0]?.sku || 'SP-01'}). Giá ưu đãi: ${formatVND(p.basePrice)}. Chị ưng màu hay size nào để em lên đơn freeship cho chị nhé ạ!`,
                                false,
                                p.image
                              );
                              setShowProductPickerForChat(false);
                            }}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-9 w-9 rounded-md object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs text-[#0F172A] truncate">{p.name}</div>
                              <div className="text-[10px] text-[#0088FF] font-bold">{formatVND(p.basePrice)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload Custom Photo to Inbox */}
                  <label className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] font-medium text-[#475569] hover:bg-slate-100 transition-colors cursor-pointer" title="Tải ảnh từ máy tính gửi khách">
                    <Paperclip className="h-3 w-3 text-slate-500" />
                    <span>Tải ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              handleSendMessage('Dạ shop gửi ảnh thực tế cho chị nhé ạ!', false, reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setMessageInput('Dạ chị cho shop xin Số điện thoại và Địa chỉ nhận hàng để shop lên đơn miễn phí giao hàng cho chị nhé ạ!')}
                    className="hover:text-[#0088FF] font-medium cursor-pointer"
                  >
                    $xin_sdt
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageInput('Dạ mẫu này shop đang có giá ưu đãi sale 99k/2 đôi tặng kèm voucher freeship ạ!')}
                    className="hover:text-[#0088FF] font-medium cursor-pointer"
                  >
                    #báo_giá
                  </button>
                </div>

                {/* ACHAT PROMINENT BUTTON: [Tạo đơn (F1)] -> Opens Right Window */}
                <button
                  type="button"
                  onClick={() => handleTriggerCreateOrder()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0088FF] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#0077E6] active:bg-[#0066CC] transition-all transform hover:scale-102 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cửa sổ lên đơn (F1)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
          <MessageSquare className="h-12 w-12 text-[#94A3B8] mb-3" />
          <h3 className="font-bold text-base text-[#0F172A]">Chưa có cuộc hội thoại nào</h3>
          <p className="text-xs text-[#64748B] max-w-sm mt-1">
            Chọn một Fanpage từ danh sách bên trái hoặc kết nối thêm Fanpage mới để bắt đầu chốt đơn.
          </p>
        </div>
      )}

      {/* ========================================================
          COLUMN 3: RIGHT SIDEBAR (Cửa sổ lên đơn trực quan / Lịch sử / Khách)
         ======================================================== */}
      {showRightSidebar && activeConversation && (
        <div className={`${chatLayoutMode === 'wide' ? 'w-84 xl:w-92' : 'w-96 lg:w-[420px]'} border-l border-[#E2E8F0] bg-white flex flex-col shrink-0 text-xs shadow-xs transition-all`}>
          {/* Right Tabs */}
          <div className="flex border-b border-[#E2E8F0] text-xs font-semibold bg-slate-50/50">
            <button
              onClick={() => setRightTab('create_order')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                rightTab === 'create_order'
                  ? 'border-[#0088FF] text-[#0088FF] font-bold bg-white'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Lên đơn (F1)</span>
            </button>
            <button
              onClick={() => setRightTab('orders')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
                rightTab === 'orders'
                  ? 'border-[#0088FF] text-[#0088FF] font-bold bg-white'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Đơn hàng ({customerOrders.length})
            </button>
            <button
              onClick={() => setRightTab('customer')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
                rightTab === 'customer'
                  ? 'border-[#0088FF] text-[#0088FF] font-bold bg-white'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Khách hàng
            </button>
            <button
              onClick={() => setRightTab('notes')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
                rightTab === 'notes'
                  ? 'border-[#0088FF] text-[#0088FF] font-bold bg-white'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Ghi chú
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 1. DOCKED ORDER CREATION PANEL (user's explicit requirement: "cửa sổ lên đơn ở ngay bên phải phần chốt đơn nhìn trực quan") */}
            {rightTab === 'create_order' && (
              <DockedOrderCreationPanel
                conversation={activeConversation}
                products={products}
                carriers={carriers}
                activeBranch={activeBranch}
                onSaveOrder={(newOrder, printImmediately) => {
                  if (onDirectCreateOrder) {
                    onDirectCreateOrder(newOrder, printImmediately);
                  }
                  // Auto reply confirmation in conversation
                  handleSendMessage(
                    `Dạ shop đã xác nhận lên đơn hàng #${newOrder.code} cho ${newOrder.customer.name}! Tổng thanh toán: ${formatVND(newOrder.totalAmount)} (COD). Hàng sẽ được chuẩn bị và gửi đi sớm nhất ạ!`,
                    true
                  );
                }}
                onOpenFullscreenModal={() => onOpenCreateOrderWithData({
                  customerName: activeConversation.customerName,
                  customerPhone: activeConversation.customerPhone || '',
                  customerAddress: activeConversation.customerAddress || '',
                  sourcePageName: activeConversation.pageName,
                })}
              />
            )}

            {rightTab !== 'create_order' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {rightTab === 'orders' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider">
                    Lịch sử đơn hàng
                  </span>
                  <button
                    onClick={() => handleTriggerCreateOrder()}
                    className="text-[11px] text-[#0088FF] font-bold hover:underline cursor-pointer"
                  >
                    + Tạo đơn mới
                  </button>
                </div>

                {customerOrders.length > 0 ? (
                  <div className="space-y-2.5">
                    {customerOrders.map((ord) => {
                      const badge = getStatusBadge(ord.status);
                      const carrier = carriers.find((c) => c.id === ord.carrierId) || carriers[0];

                      return (
                        <div
                          key={ord.id}
                          className="rounded-xl border border-[#CBD5E1] p-3 space-y-2 bg-[#F8FAFC] hover:bg-white transition-all shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-[#0088FF]">
                              {ord.code}
                            </span>
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#475569] space-y-1">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate max-w-[170px]">{it.quantity}x {it.productName}</span>
                                <span className="font-semibold">{formatVND(it.total)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-[#E2E8F0] pt-2 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Truck className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-semibold">{carrier?.code || 'J&T'}</span>
                              {ord.trackingCode && (
                                <span className="font-mono text-emerald-700 font-bold">{ord.trackingCode}</span>
                              )}
                            </div>
                            <span className="font-bold text-xs text-[#0F172A]">
                              {formatVND(ord.totalAmount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] text-center space-y-2 bg-slate-50">
                    <p className="text-slate-500 text-[11px]">Khách hàng chưa có đơn hàng nào.</p>
                    <button
                      onClick={() => handleTriggerCreateOrder()}
                      className="rounded-lg bg-[#0088FF] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0077E6] cursor-pointer"
                    >
                      Lên đơn hàng đầu tiên
                    </button>
                  </div>
                )}
              </div>
            )}

            {rightTab === 'customer' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#CBD5E1] p-3.5 bg-[#F8FAFC] space-y-2.5">
                  <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider block">
                    Hồ sơ khách hàng
                  </span>
                  <div>
                    <div className="text-[10px] text-[#64748B]">Họ và tên:</div>
                    <div className="font-bold text-xs text-[#0F172A]">{activeConversation.customerName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B]">Số điện thoại:</div>
                    <div className="font-mono font-bold text-xs text-emerald-700">
                      {activeConversation.customerPhone || 'Chưa cung cấp'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B]">Địa chỉ giao hàng:</div>
                    <div className="font-medium text-xs text-[#334155]">
                      {activeConversation.customerAddress || 'Chưa có địa chỉ'}
                    </div>
                  </div>
                </div>

                {/* Staff Assignment */}
                <div className="rounded-xl border border-[#CBD5E1] p-3.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider">
                      Nhân viên phụ trách
                    </span>
                    {onOpenStaffManagement && (
                      <button
                        onClick={onOpenStaffManagement}
                        className="text-[10px] text-[#0088FF] font-semibold hover:underline"
                      >
                        Quản lý
                      </button>
                    )}
                  </div>
                  <select
                    value={activeConversation.assignedStaffId || currentStaff?.id || ''}
                    onChange={(e) => {
                      const found = staffList.find((s) => s.id === e.target.value);
                      if (found) handleAssignStaff(found);
                    }}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] outline-none"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {rightTab === 'notes' && (
              <div className="space-y-3">
                <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider block">
                  Ghi chú nội bộ
                </span>
                <textarea
                  rows={4}
                  placeholder="Ghi chú về khách hàng, yêu cầu giao hàng, lịch sử mặc cả..."
                  value={activeConversation.notes || ''}
                  onChange={(e) =>
                    onUpdateConversation({
                      ...activeConversation,
                      notes: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#CBD5E1] p-3 text-xs outline-none focus:border-[#0088FF]"
                />
              </div>
            )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          COLUMN 4: AI ASSISTANT PANEL (collapsible)
         ======================================================== */}
      <AIAssistantPanel onOpenTraining={() => {}} />
    </div>
  );
};
