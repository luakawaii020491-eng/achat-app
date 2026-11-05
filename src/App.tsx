import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { SocialChannelView } from './components/SocialChannelView';
import { DashboardView } from './components/DashboardView';
import { LivestreamChotDonView } from './components/LivestreamChotDonView';
import { OrdersListView } from './components/OrdersListView';
import { CreateOrderModal } from './components/CreateOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { ProductsView } from './components/ProductsView';
import { CustomersView } from './components/CustomersView';
import { SettingsModal } from './components/SettingsModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { HashtagManagerModal } from './components/HashtagManagerModal';
import { FanpageConnectionModal } from './components/FanpageConnectionModal';
import { BarcodeStockInModal } from './components/BarcodeStockInModal';
import { ShippingCarriersModal } from './components/ShippingCarriersModal';
import { StaffManagementModal } from './components/StaffManagementModal';
import { AiTrainingModal } from './components/AiTrainingModal';
import HelpAssistantWidget from './components/HelpAssistantWidget';
import { BranchManagementModal } from './components/BranchManagementModal';
import { CodReconciliationModal } from './components/CodReconciliationModal';
import { StaffAuthModal } from './components/StaffAuthModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { QuickReplyModal } from './components/QuickReplyModal';
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_FANPAGES,
  INITIAL_HASHTAGS,
  INITIAL_CONVERSATIONS,
  INITIAL_STOCK_IN_TICKETS,
  INITIAL_STAFF,
  INITIAL_AI_SETTINGS,
  INITIAL_QUICK_REPLIES,
} from './data/mockData';
import {
  Customer,
  Order,
  OrderStatus,
  Product,
  Fanpage,
  HashtagLabel,
  Conversation,
  StockInTicket,
  ShippingCarrier,
  StaffMember,
  AiStoreSettings,
  Branch,
  OrderFilterCriteria,
  SavedOrderFilter,
  QuickReplyTemplate,
} from './types';
import {
  SHIPPING_CARRIERS,
  ORDER_STATUS_TAG_MAP,
  INITIAL_BRANCHES,
  INITIAL_SAVED_ORDER_FILTERS,
} from './utils/formatters';
import {
  LayoutDashboard,
  MessageSquare,
  Radio,
  ShoppingBag,
  Package,
  Plus,
} from 'lucide-react';

export default function App() {
  // Main Achat Data State with localStorage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('achat_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any old orders referencing demo pages
        const hasOld = parsed.some((o: Order) => o.sourcePageName === 'LÀM ĐẸP 360' || o.sourcePageName === 'BINBIN SHOP');
        if (!hasOld && Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('achat_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new weight and dynamic attributes are present
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].weight !== undefined) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('achat_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CUSTOMERS;
  });

  const [fanpages, setFanpages] = useState<Fanpage[]>(() => {
    try {
      const saved = localStorage.getItem('achat_fanpages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FANPAGES;
  });

  const [hashtags, setHashtags] = useState<HashtagLabel[]>(() => {
    try {
      const saved = localStorage.getItem('achat_hashtags');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_HASHTAGS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('achat_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CONVERSATIONS;
  });

  const [stockInTickets, setStockInTickets] = useState<StockInTicket[]>(() => {
    try {
      const saved = localStorage.getItem('achat_stock_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STOCK_IN_TICKETS;
  });

  // Shipping Carriers State - ensure all connected
  const [carriers, setCarriers] = useState<ShippingCarrier[]>(() => {
    try {
      const saved = localStorage.getItem('achat_carriers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: ShippingCarrier) => ({ ...c, isConnected: true }));
        }
      }
    } catch {}
    return SHIPPING_CARRIERS;
  });

  // Branches State
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('achat_branches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BRANCHES;
  });

  // Saved Order Filter Presets
  const [savedOrderFilters, setSavedOrderFilters] = useState<SavedOrderFilter[]>(() => {
    try {
      const saved = localStorage.getItem('achat_saved_order_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SAVED_ORDER_FILTERS;
  });

  // Staff & RBAC State - Super Admin khuyendv guaranteed present and default
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('achat_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasKhuyen = parsed.some(
            (s: StaffMember) => s.username === 'khuyendv' || s.id === 'staff-khuyendv'
          );
          if (!hasKhuyen) {
            return [INITIAL_STAFF[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_STAFF;
  });

  const [currentStaffId, setCurrentStaffId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('achat_current_staff_id');
      if (saved && saved !== 'staff-admin') return saved;
    } catch {}
    return 'staff-khuyendv';
  });

  const currentStaff = staffList.find((s) => s.id === currentStaffId) || staffList[0];

  // AI Store Settings & Product Prompt Training State
  const [aiSettings, setAiSettings] = useState<AiStoreSettings>(() => {
    try {
      const saved = localStorage.getItem('achat_ai_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return INITIAL_AI_SETTINGS;
  });

  const [activeBranch, setActiveBranch] = useState('Kho Tổng - TP. Hồ Chí Minh');
  // Default to social_chat so the user immediately sees their uploaded screenshot interface!
  const [currentTab, setCurrentTab] = useState<NavTab>('social_chat');
  const [ordersFilterStatus, setOrdersFilterStatus] = useState<OrderStatus | 'all'>('all');

  // Modals state
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [createOrderInitialData, setCreateOrderInitialData] = useState<{
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    sourcePageName?: string;
  }>({});
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [bulkPrintOrders, setBulkPrintOrders] = useState<Order[] | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isHashtagManagerOpen, setIsHashtagManagerOpen] = useState(false);
  const [isFanpageConnectOpen, setIsFanpageConnectOpen] = useState(false);
  const [isBarcodeStockInOpen, setIsBarcodeStockInOpen] = useState(false);
  const [isShippingCarriersOpen, setIsShippingCarriersOpen] = useState(false);
  const [isStaffManagementOpen, setIsStaffManagementOpen] = useState(false);
  const [isStaffAuthOpen, setIsStaffAuthOpen] = useState(false);
  const [isBranchManagementOpen, setIsBranchManagementOpen] = useState(false);
  const [isCodReconciliationOpen, setIsCodReconciliationOpen] = useState(false);
  const [isAiTrainingOpen, setIsAiTrainingOpen] = useState(false);
  const [aiTrainingProductId, setAiTrainingProductId] = useState<string | undefined>(undefined);

  // Collapsible Sidebar State (with arrow icon)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('achat_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Help Center State
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [helpCenterTab, setHelpCenterTab] = useState<'overview' | 'facebook' | 'carriers' | 'order_closing' | 'print_pdf' | 'shortcuts' | 'tax'>('overview');

  // Quick Reply Templates State (Câu trả lời mẫu cho nhân viên tư vấn)
  const [quickReplies, setQuickReplies] = useState<QuickReplyTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('achat_quick_replies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_QUICK_REPLIES;
  });
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);

  const handleAddQuickReply = (newTemplate: QuickReplyTemplate) => {
    setQuickReplies((prev) => [newTemplate, ...prev]);
  };
  const handleUpdateQuickReply = (updated: QuickReplyTemplate) => {
    setQuickReplies((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };
  const handleDeleteQuickReply = (id: string) => {
    setQuickReplies((prev) => prev.filter((q) => q.id !== id));
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('achat_orders', JSON.stringify(orders));
      localStorage.setItem('achat_products', JSON.stringify(products));
      localStorage.setItem('achat_customers', JSON.stringify(customers));
      localStorage.setItem('achat_fanpages', JSON.stringify(fanpages));
      localStorage.setItem('achat_hashtags', JSON.stringify(hashtags));
      localStorage.setItem('achat_conversations', JSON.stringify(conversations));
      localStorage.setItem('achat_stock_tickets', JSON.stringify(stockInTickets));
      localStorage.setItem('achat_carriers', JSON.stringify(carriers));
      localStorage.setItem('achat_branches', JSON.stringify(branches));
      localStorage.setItem('achat_saved_order_filters', JSON.stringify(savedOrderFilters));
      localStorage.setItem('achat_staff', JSON.stringify(staffList));
      localStorage.setItem('achat_current_staff_id', currentStaffId);
      localStorage.setItem('achat_ai_settings', JSON.stringify(aiSettings));
    } catch {}
  }, [
    orders,
    products,
    customers,
    fanpages,
    hashtags,
    conversations,
    stockInTickets,
    carriers,
    branches,
    savedOrderFilters,
    staffList,
    currentStaffId,
    aiSettings,
  ]);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Order Handlers
  const handleOrderCreated = (newOrder: Order, printImmediately = false) => {
    // 1. Lưu đơn hàng vào danh sách
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Tự động trừ tồn kho sản phẩm trong kho hàng (Auto-Deduct Inventory)
    if (newOrder.items && newOrder.items.length > 0) {
      setProducts((prev) =>
        prev.map((prod) => {
          // Kiểm tra xem sản phẩm này có mặt trong các mặt hàng của đơn không
          const matchedItems = newOrder.items.filter(
            (it) => it.productId === prod.id || it.productName.toLowerCase() === prod.name.toLowerCase()
          );

          if (matchedItems.length === 0) return prod;

          // Trừ tồn kho từng biến thể tương ứng
          const updatedVariants = prod.variants.map((v) => {
            const itemDeduct = matchedItems.find(
              (it) =>
                it.variantId === v.id ||
                (v.sku && it.sku === v.sku) ||
                (v.barcode && it.barcode === v.barcode) ||
                (it.variantTitle && v.title && it.variantTitle.toLowerCase() === v.title.toLowerCase())
            );
            if (itemDeduct) {
              const remaining = Math.max(0, v.stock - itemDeduct.quantity);
              return { ...v, stock: remaining };
            }
            return v;
          });

          const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
          return {
            ...prod,
            variants: updatedVariants,
            totalStock: newTotalStock,
          };
        })
      );
    }

    // 3. Update customer stats
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === newOrder.customer.phone);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + newOrder.totalAmount,
              }
            : c
        );
      }
      return [newOrder.customer, ...prev];
    });

    // 4. Mark matching conversation as having order & add "ĐÃ CHỐT ĐƠN" / "ĐÃ LÊN ĐƠN" tag
    setConversations((prev) =>
      prev.map((conv) => {
        if (
          (newOrder.customer.phone && conv.customerPhone === newOrder.customer.phone) ||
          conv.customerName.toLowerCase() === newOrder.customer.name.toLowerCase()
        ) {
          // Status tag for newly created order
          const statusTag = ORDER_STATUS_TAG_MAP[newOrder.status]?.id || 'tag-da-len-don';
          const statusTagIds = Object.values(ORDER_STATUS_TAG_MAP).map((t) => t.id);
          const cleanedTags = (conv.tags || []).filter((t) => !statusTagIds.includes(t));
          return {
            ...conv,
            hasOrder: true,
            tags: Array.from(new Set([...cleanedTags, 'tag-da-chot', statusTag])),
          };
        }
        return conv;
      })
    );

    if (printImmediately) {
      setPrintingOrder(newOrder);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let targetOrder: Order | undefined;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          targetOrder = { ...o, status: newStatus };
          return targetOrder;
        }
        return o;
      })
    );

    // Sync status tag to customer's chat conversation
    const newTagId = ORDER_STATUS_TAG_MAP[newStatus]?.id;
    if (newTagId && targetOrder) {
      const orderCust = (targetOrder as Order).customer;
      const statusTagIds = Object.values(ORDER_STATUS_TAG_MAP).map((t) => t.id);
      setConversations((prev) =>
        prev.map((conv) => {
          const matchPhone = orderCust.phone && conv.customerPhone === orderCust.phone;
          const matchName = orderCust.name && conv.customerName.toLowerCase() === orderCust.name.toLowerCase();
          if (matchPhone || matchName) {
            const cleanedTags = (conv.tags || []).filter((t) => !statusTagIds.includes(t));
            return {
              ...conv,
              tags: Array.from(new Set([...cleanedTags, newTagId])),
            };
          }
          return conv;
        })
      );
    }

    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleTogglePaid = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, isPaid: !o.isPaid } : o))
    );
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder((prev) => (prev ? { ...prev, isPaid: !prev.isPaid } : null));
    }
  };

  const handleBulkPushOrders = (
    orderIds: string[],
    carrierId: string,
    results: any[]
  ) => {
    const map = new Map<string, any>();
    if (Array.isArray(results)) {
      results.forEach((r) => map.set(r.orderId, r));
    }
    const targetOrders = orders.filter((o) => orderIds.includes(o.id));
    const customerPhones = new Set(targetOrders.map((o) => o.customer.phone).filter(Boolean));
    const customerNames = new Set(targetOrders.map((o) => o.customer.name.toLowerCase()));

    setOrders((prev) =>
      prev.map((ord) => {
        if (orderIds.includes(ord.id)) {
          const res = map.get(ord.id);
          return {
            ...ord,
            status: 'shipping' as OrderStatus,
            carrierId: carrierId as any,
            trackingCode: res?.trackingCode || ord.trackingCode,
            sortCode: res?.sortCode || ord.sortCode,
            pushedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    // Sync #ĐãĐẩyVậnChuyển (tag-da-day-vc) to matching customer conversations
    const statusTagIds = Object.values(ORDER_STATUS_TAG_MAP).map((t) => t.id);
    setConversations((prev) =>
      prev.map((conv) => {
        if (
          (conv.customerPhone && customerPhones.has(conv.customerPhone)) ||
          customerNames.has(conv.customerName.toLowerCase())
        ) {
          const cleanedTags = (conv.tags || []).filter((t) => !statusTagIds.includes(t));
          return {
            ...conv,
            tags: Array.from(new Set([...cleanedTags, 'tag-da-day-vc'])),
          };
        }
        return conv;
      })
    );
  };

  // Product & Inventory Handlers
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleDeleteMultipleProducts = (productIds: string[]) => {
    setProducts((prev) => prev.filter((p) => !productIds.includes(p.id)));
  };

  const handleUpdateProductStock = (productId: string, variantId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.map((v) =>
          v.id === variantId ? { ...v, stock: newStock } : v
        );
        const updatedTotal = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          ...p,
          variants: updatedVariants,
          totalStock: updatedTotal,
        };
      })
    );
  };

  // Barcode Stock-In Confirmation: Auto-increments inventory!
  const handleConfirmStockIn = (ticket: StockInTicket) => {
    setStockInTickets((prev) => [ticket, ...prev]);

    // Update variant stock in products
    setProducts((prev) =>
      prev.map((p) => {
        let hasChanged = false;
        const updatedVariants = p.variants.map((v) => {
          const itemInTicket = ticket.items.find((it) => it.barcode === v.barcode || it.sku === v.sku);
          if (itemInTicket) {
            hasChanged = true;
            return {
              ...v,
              stock: v.stock + itemInTicket.quantity,
              costPrice: itemInTicket.costPrice || v.costPrice,
            };
          }
          return v;
        });

        if (hasChanged) {
          const updatedTotal = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
          return {
            ...p,
            variants: updatedVariants,
            totalStock: updatedTotal,
          };
        }
        return p;
      })
    );
  };

  // Customer Handlers
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const handleDeleteMultipleCustomers = (customerIds: string[]) => {
    setCustomers((prev) => prev.filter((c) => !customerIds.includes(c.id)));
  };

  // Fanpage API Handlers
  const handleTogglePageConnection = (pageId: string) => {
    setFanpages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, isConnected: !p.isConnected } : p))
    );
  };

  const handleToggleAutoHidePhone = (pageId: string) => {
    setFanpages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, autoHideCommentWithPhone: !p.autoHideCommentWithPhone } : p
      )
    );
  };

  const handleSyncMessagesForPage = async (pageId: string) => {
    try {
      const page = fanpages.find((p) => p.id === pageId || p.pageId === pageId) || fanpages[0];
      const res = await fetch('/api/facebook/sync-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: page ? page.id : pageId,
          pageName: page ? page.name : 'Shop Bé Đan',
        }),
      });
      const data = await res.json();
      if (data.conversations && Array.isArray(data.conversations)) {
        setConversations((prev) => {
          const newIds = new Set(data.conversations.map((c: any) => c.id));
          const filtered = prev.filter((c) => !newIds.has(c.id));
          return [...data.conversations, ...filtered];
        });
      }
    } catch (err) {
      console.error('Failed to sync messages:', err);
    }
  };

  const handleAddFanpage = (newPage: Fanpage) => {
    setFanpages((prev) => [...prev, newPage]);
    handleSyncMessagesForPage(newPage.id);
  };

  const handleAddMultipleFanpages = (newPages: Fanpage[]) => {
    setFanpages((prev) => {
      const existingIds = new Set(prev.map((p) => p.pageId));
      const toAdd = newPages.filter((p) => !existingIds.has(p.pageId));
      const updated = prev.map((p) => {
        const match = newPages.find((np) => np.pageId === p.pageId);
        return match ? { ...p, isConnected: true } : p;
      });
      return [...updated, ...toAdd];
    });
    newPages.forEach((p) => handleSyncMessagesForPage(p.id));
  };

  // Automatically ensure every connected Fanpage has conversations loaded
  useEffect(() => {
    fanpages.forEach((p) => {
      const hasChats = conversations.some(
        (c) =>
          c.pageId === p.id ||
          c.pageId === p.pageId ||
          c.pageName.toLowerCase() === p.name.toLowerCase()
      );
      if (!hasChats) {
        handleSyncMessagesForPage(p.id);
      }
    });
  }, [fanpages.length]);

  const handleSimulateIncomingWebhookMessage = (incoming: {
    customerName: string;
    phone: string;
    text: string;
    pageName: string;
  }) => {
    const newId = `conv-sim-${Date.now()}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newConv: Conversation = {
      id: newId,
      pageId: fanpages[0]?.id || 'page-dan',
      pageName: incoming.pageName || fanpages[0]?.name || 'Shop Bé Đan',
      customerName: incoming.customerName,
      customerPhone: incoming.phone,
      customerAvatarColor: 'bg-indigo-600',
      customerAvatarInitials: incoming.customerName.slice(0, 2).toUpperCase(),
      lastMessage: incoming.text,
      lastMessageTime: timeStr,
      type: 'message',
      unreadCount: 1,
      hasPhone: Boolean(incoming.phone),
      hasOrder: false,
      tags: ['tag-4'], // CHƯA CHỐT
      isBusinessAgentActive: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          text: incoming.text,
          time: timeStr,
          isPhoneExtracted: Boolean(incoming.phone),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setCurrentTab('social_chat');
  };

  // Hashtag Handlers
  const handleAddHashtag = (newTag: HashtagLabel) => {
    setHashtags((prev) => [...prev, newTag]);
  };

  const handleDeleteHashtag = (tagId: string) => {
    setHashtags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  // Saved Order Filter Presets Handlers
  const handleSaveOrderFilter = (name: string, criteria: OrderFilterCriteria) => {
    const newFilter: SavedOrderFilter = {
      id: `filter-${Date.now()}`,
      name,
      criteria,
      createdAt: new Date().toISOString(),
    };
    setSavedOrderFilters((prev) => [...prev, newFilter]);
  };

  const handleDeleteSavedOrderFilter = (id: string) => {
    setSavedOrderFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // Branch Management Handlers
  const handleAddBranch = (newBranch: Branch) => {
    setBranches((prev) => [...prev, newBranch]);
  };

  const handleUpdateBranch = (updated: Branch) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
  };

  // COD & Bank Reconciliation Handlers
  const handleBatchConfirmPaidFromReconciliation = (orderIds: string[]) => {
    setOrders((prev) =>
      prev.map((o) => (orderIds.includes(o.id) ? { ...o, isPaid: true } : o))
    );
  };

  // Reset to default Achat sample data
  const handleResetData = () => {
    setOrders(INITIAL_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setFanpages(INITIAL_FANPAGES);
    setHashtags(INITIAL_HASHTAGS);
    setConversations(INITIAL_CONVERSATIONS);
    setStockInTickets(INITIAL_STOCK_IN_TICKETS);
    setCarriers(SHIPPING_CARRIERS);
    setStaffList(INITIAL_STAFF);
    setCurrentStaffId(INITIAL_STAFF[0]?.id || 'staff-admin');
    setAiSettings(INITIAL_AI_SETTINGS);
    localStorage.clear();
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F8]">
      {/* Achat Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        pendingCount={pendingCount}
        unreadChatCount={unreadChatCount}
        onOpenBarcodeStockIn={() => setIsBarcodeStockInOpen(true)}
        onOpenFanpageConnect={() => setIsFanpageConnectOpen(true)}
        onOpenShippingCarriers={() => setIsShippingCarriersOpen(true)}
        onOpenStaffManagement={() => setIsStaffManagementOpen(true)}
        onOpenBranchManagement={() => setIsBranchManagementOpen(true)}
        onOpenCodReconciliation={() => setIsCodReconciliationOpen(true)}
        onOpenAiTraining={() => {
          setAiTrainingProductId(undefined);
          setIsAiTrainingOpen(true);
        }}
        carrierCount={carriers.filter((c) => c.isConnected).length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => {
          setIsSidebarCollapsed((prev) => {
            const next = !prev;
            try {
              localStorage.setItem('achat_sidebar_collapsed', String(next));
            } catch {}
            return next;
          });
        }}
        onOpenHelpCenter={() => {
          setHelpCenterTab('overview');
          setIsHelpCenterOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <Header
          onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
          onOpenCreateOrder={() => {
            setCreateOrderInitialData({});
            setIsCreateOrderOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNavigateToSocial={() => setCurrentTab('social_chat')}
          onOpenBarcodeStockIn={() => setIsBarcodeStockInOpen(true)}
          activeBranch={activeBranch}
          onChangeBranch={setActiveBranch}
          onNavigateToLive={() => setCurrentTab('livestream')}
          isLiveActive={true}
          totalPendingOrders={pendingCount}
          unreadChatCount={unreadChatCount}
          currentStaff={currentStaff}
          onOpenStaffManagement={() => setIsStaffManagementOpen(true)}
          onOpenShippingCarriers={() => setIsShippingCarriersOpen(true)}
          onOpenBranchManagement={() => setIsBranchManagementOpen(true)}
          onOpenCodReconciliation={() => setIsCodReconciliationOpen(true)}
          onOpenFanpageConnect={() => setIsFanpageConnectOpen(true)}
          onOpenStaffAuth={() => setIsStaffAuthOpen(true)}
          branches={branches}
          fanpageCount={fanpages.length}
          onOpenAiTraining={() => {
            setAiTrainingProductId(undefined);
            setIsAiTrainingOpen(true);
          }}
          onOpenHelpCenter={(tab) => {
            setHelpCenterTab(tab || 'overview');
            setIsHelpCenterOpen(true);
          }}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto h-full">
            {/* 1. ACHAT SOCIAL CHANNEL: CHỐT ĐƠN ĐA FANPAGE */}
            {currentTab === 'social_chat' && (
              <SocialChannelView
                fanpages={fanpages}
                conversations={conversations}
                hashtags={hashtags}
                products={products}
                customers={customers}
                orders={orders}
                staffList={staffList}
                currentStaff={currentStaff}
                aiSettings={aiSettings}
                carriers={carriers}
                quickReplies={quickReplies}
                onOpenQuickRepliesModal={() => setIsQuickReplyModalOpen(true)}
                onDirectCreateOrder={handleOrderCreated}
                onOpenCreateOrderWithData={(data) => {
                  setCreateOrderInitialData(data);
                  setIsCreateOrderOpen(true);
                }}
                onUpdateConversation={handleUpdateConversation}
                onOpenHashtagManager={() => setIsHashtagManagerOpen(true)}
                onOpenFanpageSettings={() => setIsFanpageConnectOpen(true)}
                onOpenShippingCarriers={() => setIsShippingCarriersOpen(true)}
                onOpenStaffManagement={() => setIsStaffManagementOpen(true)}
                onOpenAiTraining={(productId) => {
                  setAiTrainingProductId(productId);
                  setIsAiTrainingOpen(true);
                }}
                onSyncPageMessages={handleSyncMessagesForPage}
                onGenerateSampleChatsForPage={(pageId) => handleSyncMessagesForPage(pageId)}
              />
            )}

            {/* 2. DASHBOARD */}
            {currentTab === 'dashboard' && (
              <DashboardView
                orders={orders}
                products={products}
                onSelectOrderStatus={(st) => {
                  setOrdersFilterStatus(st);
                  setCurrentTab('orders');
                }}
                onNavigateToTab={(tab) => setCurrentTab(tab as any)}
                onOpenCreateOrder={() => {
                  setCreateOrderInitialData({});
                  setIsCreateOrderOpen(true);
                }}
                onViewOrder={(ord) => setViewingOrder(ord)}
              />
            )}

            {/* 3. LIVESTREAM */}
            {currentTab === 'livestream' && (
              <LivestreamChotDonView
                products={products}
                customers={customers}
                onOrderCreated={(o) => handleOrderCreated(o)}
                onPrintOrder={(o) => setPrintingOrder(o)}
                orders={orders}
              />
            )}

            {/* 4. ORDERS */}
            {currentTab === 'orders' && (
              <OrdersListView
                orders={orders}
                products={products}
                branches={branches}
                staffList={staffList}
                customers={customers}
                carriers={carriers}
                savedFilters={savedOrderFilters}
                onSaveFilter={handleSaveOrderFilter}
                onDeleteSavedFilter={handleDeleteSavedOrderFilter}
                initialFilterStatus={ordersFilterStatus}
                onViewOrder={(ord) => setViewingOrder(ord)}
                onPrintOrder={(ord) => {
                  setBulkPrintOrders(null);
                  setPrintingOrder(ord);
                }}
                onPrintBulkOrders={(bulkList) => {
                  setBulkPrintOrders(bulkList);
                  setPrintingOrder(bulkList[0] || null);
                }}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onBulkPushOrders={handleBulkPushOrders}
                onOpenCreateOrder={() => {
                  setCreateOrderInitialData({});
                  setIsCreateOrderOpen(true);
                }}
                onOpenShippingCarriers={() => setIsShippingCarriersOpen(true)}
                onOpenCodReconciliation={() => setIsCodReconciliationOpen(true)}
              />
            )}

            {/* 5. PRODUCTS & INVENTORY */}
            {currentTab === 'products' && (
              <ProductsView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onDeleteMultipleProducts={handleDeleteMultipleProducts}
                onUpdateProductStock={handleUpdateProductStock}
              />
            )}

            {/* 6. CUSTOMERS CRM */}
            {currentTab === 'customers' && (
              <CustomersView
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onDeleteMultipleCustomers={handleDeleteMultipleCustomers}
                onSelectCustomerForOrder={(c) => {
                  setCreateOrderInitialData({
                    customerName: c.name,
                    customerPhone: c.phone,
                    customerAddress: `${c.address}, ${c.ward}, ${c.district}, ${c.city}`,
                  });
                  setIsCreateOrderOpen(true);
                }}
              />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden flex items-center justify-around border-t border-[#E2E8F0] bg-white py-2 px-1 text-[10px] text-[#64748B] z-30 shrink-0">
          <button
            onClick={() => setCurrentTab('social_chat')}
            className={`flex flex-col items-center gap-1 relative ${
              currentTab === 'social_chat' ? 'text-[#0088FF] font-bold' : ''
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Fanpage</span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'dashboard' ? 'text-[#0088FF] font-bold' : ''
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Tổng quan</span>
          </button>
          <button
            onClick={() => {
              setCreateOrderInitialData({});
              setIsCreateOrderOpen(true);
            }}
            className="flex flex-col items-center justify-center -mt-5 h-11 w-11 rounded-full bg-[#0088FF] text-white shadow-md"
          >
            <Plus className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentTab('orders')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'orders' ? 'text-[#0088FF] font-bold' : ''
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Đơn hàng</span>
          </button>
          <button
            onClick={() => setCurrentTab('products')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'products' ? 'text-[#0088FF] font-bold' : ''
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Kho hàng</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        products={products}
        customers={customers}
        onSaveOrder={handleOrderCreated}
        activeBranch={activeBranch}
        initialData={createOrderInitialData}
      />

      <OrderDetailModal
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onPrintOrder={(ord) => setPrintingOrder(ord)}
        onUpdateStatus={handleUpdateOrderStatus}
        onTogglePaid={handleTogglePaid}
      />

      <PrintInvoiceModal
        order={printingOrder}
        ordersToPrint={bulkPrintOrders || undefined}
        onClose={() => {
          setPrintingOrder(null);
          setBulkPrintOrders(null);
        }}
      />

      {/* Branch Management Modal */}
      <BranchManagementModal
        isOpen={isBranchManagementOpen}
        onClose={() => setIsBranchManagementOpen(false)}
        branches={branches}
        activeBranchId={branches.find((b) => b.name === activeBranch)?.id || branches[0]?.id || 'branch-1'}
        onSelectActiveBranch={(bName) => setActiveBranch(bName)}
        onAddBranch={handleAddBranch}
        onUpdateBranch={handleUpdateBranch}
        onDeleteBranch={handleDeleteBranch}
      />

      {/* COD & Bank Reconciliation Modal */}
      <CodReconciliationModal
        isOpen={isCodReconciliationOpen}
        onClose={() => setIsCodReconciliationOpen(false)}
        orders={orders}
        onBatchConfirmPaid={handleBatchConfirmPaidFromReconciliation}
      />

      {/* Staff Authentication (Register & Login) Modal */}
      <StaffAuthModal
        isOpen={isStaffAuthOpen}
        onClose={() => setIsStaffAuthOpen(false)}
        staffList={staffList}
        currentStaffId={currentStaffId}
        onLoginSuccess={(staffId) => {
          setCurrentStaffId(staffId);
        }}
        onRegisterStaff={(newStaff) => {
          setStaffList((prev) => [...prev, newStaff]);
          setCurrentStaffId(newStaff.id);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={handleResetData}
      />

      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        orders={orders}
        products={products}
        customers={customers}
        onSelectOrder={(ord) => setViewingOrder(ord)}
        onSelectCustomer={(cust) => {
          setCurrentTab('customers');
        }}
      />

      <HashtagManagerModal
        isOpen={isHashtagManagerOpen}
        onClose={() => setIsHashtagManagerOpen(false)}
        hashtags={hashtags}
        onAddHashtag={handleAddHashtag}
        onDeleteHashtag={handleDeleteHashtag}
      />

      <FanpageConnectionModal
        isOpen={isFanpageConnectOpen}
        onClose={() => setIsFanpageConnectOpen(false)}
        fanpages={fanpages}
        onTogglePageConnection={handleTogglePageConnection}
        onToggleAutoHidePhone={handleToggleAutoHidePhone}
        onAddFanpage={handleAddFanpage}
        onAddMultipleFanpages={handleAddMultipleFanpages}
        onSimulateIncomingWebhookMessage={handleSimulateIncomingWebhookMessage}
      />

      <BarcodeStockInModal
        isOpen={isBarcodeStockInOpen}
        onClose={() => setIsBarcodeStockInOpen(false)}
        products={products}
        stockInTickets={stockInTickets}
        onConfirmStockIn={handleConfirmStockIn}
        activeBranch={activeBranch}
      />

      {/* Shipping Carriers Connection Modal (GHN, GHTK, Viettel Post, J&T, Best Express) */}
      <ShippingCarriersModal
        isOpen={isShippingCarriersOpen}
        onClose={() => setIsShippingCarriersOpen(false)}
        carriers={carriers}
        onUpdateCarriers={setCarriers}
      />

      {/* Staff Management & Role-Based Access Control Modal */}
      <StaffManagementModal
        isOpen={isStaffManagementOpen}
        onClose={() => setIsStaffManagementOpen(false)}
        staffList={staffList}
        currentStaffId={currentStaffId}
        onSelectCurrentStaff={setCurrentStaffId}
        onAddStaff={(newStaff) => setStaffList((prev) => [...prev, newStaff])}
        onDeleteStaff={(staffId) => setStaffList((prev) => prev.filter((s) => s.id !== staffId))}
        onUpdateStaff={(updated) =>
          setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        }
      />

      {/* AI Machine Learning Training & Flexible Script Modal */}
      <AiTrainingModal
        isOpen={isAiTrainingOpen}
        onClose={() => setIsAiTrainingOpen(false)}
        products={products}
        aiSettings={aiSettings}
        onUpdateAiSettings={setAiSettings}
        selectedProductIdForTraining={aiTrainingProductId}
      />

      {/* Achat In-App Help Center */}
      <HelpCenterModal
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
        initialTab={helpCenterTab}
      />

      {/* Staff Quick Reply Templates Modal */}
      <QuickReplyModal
        isOpen={isQuickReplyModalOpen}
        onClose={() => setIsQuickReplyModalOpen(false)}
        quickReplies={quickReplies}
        onAddQuickReply={handleAddQuickReply}
        onUpdateQuickReply={handleUpdateQuickReply}
        onDeleteQuickReply={handleDeleteQuickReply}
      />

      {/* Trợ lý hướng dẫn sử dụng (chat widget) */}
      <HelpAssistantWidget />
    </div>
  );
}
