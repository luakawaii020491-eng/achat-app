import { OrderStatus, SalesChannel, ShippingCarrier, StaffRole, StaffPermissions, Branch, SavedOrderFilter } from '../types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('₫', 'đ');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return dateString;
  }
}

export const SHIPPING_CARRIERS: ShippingCarrier[] = [
  {
    id: 'ghn',
    name: 'Giao Hàng Nhanh (GHN)',
    code: 'GHN',
    logoText: 'GHN',
    badgeColor: 'bg-[#0052CC] text-white',
    baseFee: 22000,
    estimatedDays: '1-2 ngày',
    isConnected: true,
    authMethod: 'api_key',
    shopId: 'GHN_SHOP_491028',
    apiKey: 'ghn_live_token_778192847120',
    partnerCode: 'GHN-BINBINBOBO',
    codBalance: 3450000,
    defaultPickupShift: 'Ca sáng (08h - 12h)',
    bankAccount: {
      bankName: 'MB Bank',
      accountNumber: '0988999888',
      accountHolder: 'NGUYEN VAN THANG',
    },
  },
  {
    id: 'ghtk',
    name: 'Giao Hàng Tiết Kiệm (GHTK)',
    code: 'GHTK',
    logoText: 'GHTK',
    badgeColor: 'bg-[#008848] text-white',
    baseFee: 22000,
    estimatedDays: '1-3 ngày',
    isConnected: true,
    authMethod: 'credentials',
    username: 'binbinbobo999@gmail.com',
    shopId: 'S10928301',
    apiKey: 'ghtk_sec_tok_9918237192',
    partnerCode: 'GHTK_HCM_88192',
    codBalance: 5120000,
    defaultPickupShift: 'Ca chiều (13h - 18h)',
    bankAccount: {
      bankName: 'Vietcombank',
      accountNumber: '1018928391',
      accountHolder: 'NGUYEN VAN THANG',
    },
  },
  {
    id: 'viettel',
    name: 'Viettel Post',
    code: 'VTP',
    logoText: 'VTP',
    badgeColor: 'bg-[#ED1C24] text-white',
    baseFee: 23000,
    estimatedDays: '1-3 ngày',
    isConnected: true,
    authMethod: 'credentials',
    username: 'khuyenlua.vtp',
    shopId: 'VTP-SGN-902',
    apiKey: 'vtp_partner_token_339182',
    partnerCode: 'VTP_ACC_339182',
    codBalance: 1850000,
    defaultPickupShift: 'Ca chiều (13h - 18h)',
    bankAccount: {
      bankName: 'MB Bank',
      accountNumber: '0988999888',
      accountHolder: 'NGUYEN VAN THANG',
    },
  },
  {
    id: 'jnt',
    name: 'J&T Express',
    code: 'J&T',
    logoText: 'J&T',
    badgeColor: 'bg-[#DC2626] text-white',
    baseFee: 20000,
    estimatedDays: '1-2 ngày',
    isConnected: true,
    authMethod: 'api_key',
    shopId: 'JT_SGN_8892',
    partnerCode: 'JT_BINBIN999',
    apiKey: 'jnt_live_sec_892318491823',
    codBalance: 4200000,
    defaultPickupShift: 'Ca chiều (13h - 18h)',
    bankAccount: {
      bankName: 'Techcombank',
      accountNumber: '19033882910',
      accountHolder: 'NGUYEN VAN THANG',
    },
  },
  {
    id: 'best',
    name: 'Best Express',
    code: 'BEST',
    logoText: 'BEST',
    badgeColor: 'bg-[#F59E0B] text-black font-bold',
    baseFee: 19500,
    estimatedDays: '1-3 ngày',
    isConnected: true,
    authMethod: 'credentials',
    username: 'best_binbin99',
    shopId: 'BEST-VN-9081',
    partnerCode: 'BEST_VN_999BOBO',
    apiKey: 'best_exp_key_993821739102',
    codBalance: 2890000,
    defaultPickupShift: 'Ca chiều (13h - 18h)',
  },
  {
    id: 'ninjavan',
    name: 'Ninja Van',
    code: 'NINJA',
    logoText: 'NJV',
    badgeColor: 'bg-[#C8102E] text-white',
    baseFee: 22000,
    estimatedDays: '1-3 ngày',
    isConnected: true,
    authMethod: 'api_key',
    apiKey: 'ninja_live_sec_7719284',
    shopId: 'NJV_SGN_091',
    codBalance: 1200000,
  },
  {
    id: 'spx',
    name: 'Shopee Xpress (SPX)',
    code: 'SPX',
    logoText: 'SPX',
    badgeColor: 'bg-[#EE4D2D] text-white',
    baseFee: 21000,
    estimatedDays: '1-2 ngày',
    isConnected: true,
    authMethod: 'credentials',
    username: 'spx_binbinbobo',
    shopId: 'SPX_VN_8829',
    codBalance: 2450000,
  },
  {
    id: 'ems',
    name: 'Bưu điện Việt Nam (VNPost / EMS)',
    code: 'EMS',
    logoText: 'EMS',
    badgeColor: 'bg-[#003B7A] text-white',
    baseFee: 24000,
    estimatedDays: '2-4 ngày',
    isConnected: true,
    authMethod: 'api_key',
    apiKey: 'ems_live_tok_99182',
    shopId: 'VNP_HAN_019',
    codBalance: 1650000,
  },
];

// Initial Store Branches
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Kho Tổng - TP. Hồ Chí Minh',
    code: 'KHO-SGN-01',
    address: '45 Lê Văn Sỹ, Phường 13, Quận 3, TP. Hồ Chí Minh',
    phone: '0988.999.888',
    isDefault: true,
    managerName: 'Nguyễn Văn Thắng',
    city: 'Hồ Chí Minh',
    district: 'Quận 3',
  },
  {
    id: 'branch-2',
    name: 'Chi nhánh Cầu Giấy - Hà Nội',
    code: 'KHO-HAN-01',
    address: '125 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
    phone: '0977.223.344',
    isDefault: false,
    managerName: 'Lê Hoàng Nam',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
  },
  {
    id: 'branch-3',
    name: 'Kho trung chuyển Hải Châu - Đà Nẵng',
    code: 'KHO-DNG-01',
    address: '78 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng',
    phone: '0912.334.455',
    isDefault: false,
    managerName: 'Trần Thị Mai',
    city: 'Đà Nẵng',
    district: 'Hải Châu',
  },
];

// Get default permissions for a staff role
export function getDefaultPermissions(role: StaffRole): StaffPermissions {
  switch (role) {
    case 'super_admin':
      return {
        canChat: true,
        canCloseOrderInChat: true,
        canManageTags: true,
        canConnectPages: true,
        canUseAiReply: true,
        canTrainAi: true,
        canViewOrders: true,
        canCreateOrder: true,
        canUpdateOrderStatus: true,
        canPushShipping: true,
        canPrintInvoice: true,
        canCancelOrder: true,
        canViewProducts: true,
        canStockInBarcode: true,
        canEditProduct: true,
        canManageCarriers: true,
        canManageBranches: true,
        canManageStaff: true,
        canViewRevenue: true,
      };
    case 'admin':
      return {
        canChat: true,
        canCloseOrderInChat: true,
        canManageTags: true,
        canConnectPages: true,
        canUseAiReply: true,
        canTrainAi: true,
        canViewOrders: true,
        canCreateOrder: true,
        canUpdateOrderStatus: true,
        canPushShipping: true,
        canPrintInvoice: true,
        canCancelOrder: true,
        canViewProducts: true,
        canStockInBarcode: true,
        canEditProduct: true,
        canManageCarriers: true,
        canManageBranches: true,
        canManageStaff: true,
        canViewRevenue: true,
      };
    case 'manager':
      return {
        canChat: true,
        canCloseOrderInChat: true,
        canManageTags: true,
        canConnectPages: true,
        canUseAiReply: true,
        canTrainAi: true,
        canViewOrders: true,
        canCreateOrder: true,
        canUpdateOrderStatus: true,
        canPushShipping: true,
        canPrintInvoice: true,
        canCancelOrder: true,
        canViewProducts: true,
        canStockInBarcode: true,
        canEditProduct: true,
        canManageCarriers: true,
        canManageBranches: true,
        canManageStaff: false,
        canViewRevenue: true,
      };
    case 'consultant':
      return {
        canChat: true,
        canCloseOrderInChat: true,
        canManageTags: true,
        canConnectPages: false,
        canUseAiReply: true,
        canTrainAi: false,
        canViewOrders: true,
        canCreateOrder: true,
        canUpdateOrderStatus: true,
        canPushShipping: false,
        canPrintInvoice: true,
        canCancelOrder: false,
        canViewProducts: true,
        canStockInBarcode: false,
        canEditProduct: false,
        canManageCarriers: false,
        canManageBranches: false,
        canManageStaff: false,
        canViewRevenue: false,
      };
    case 'warehouse':
      return {
        canChat: false,
        canCloseOrderInChat: false,
        canManageTags: false,
        canConnectPages: false,
        canUseAiReply: false,
        canTrainAi: false,
        canViewOrders: true,
        canCreateOrder: false,
        canUpdateOrderStatus: true,
        canPushShipping: true,
        canPrintInvoice: true,
        canCancelOrder: false,
        canViewProducts: true,
        canStockInBarcode: true,
        canEditProduct: false,
        canManageCarriers: false,
        canManageBranches: false,
        canManageStaff: false,
        canViewRevenue: false,
      };
    case 'accountant':
      return {
        canChat: false,
        canCloseOrderInChat: false,
        canManageTags: false,
        canConnectPages: false,
        canUseAiReply: false,
        canTrainAi: false,
        canViewOrders: true,
        canCreateOrder: false,
        canUpdateOrderStatus: true,
        canPushShipping: false,
        canPrintInvoice: true,
        canCancelOrder: false,
        canViewProducts: true,
        canStockInBarcode: false,
        canEditProduct: false,
        canManageCarriers: true,
        canManageBranches: false,
        canManageStaff: false,
        canViewRevenue: true,
      };
    case 'custom':
    default:
      return {
        canChat: true,
        canCloseOrderInChat: true,
        canManageTags: true,
        canConnectPages: false,
        canUseAiReply: true,
        canTrainAi: false,
        canViewOrders: true,
        canCreateOrder: true,
        canUpdateOrderStatus: false,
        canPushShipping: false,
        canPrintInvoice: true,
        canCancelOrder: false,
        canViewProducts: true,
        canStockInBarcode: false,
        canEditProduct: false,
        canManageCarriers: false,
        canManageBranches: false,
        canManageStaff: false,
        canViewRevenue: false,
      };
  }
}

// Map order status to standard Achat hashtag name & ID
export const ORDER_STATUS_TAG_MAP: Record<OrderStatus, { id: string; name: string }> = {
  pending: { id: 'tag-don-can-xac-nhan', name: 'Đơn cần xác nhận' },
  confirmed: { id: 'tag-da-len-don', name: 'Đã lên đơn' },
  shipping: { id: 'tag-da-day-vc', name: 'Đã đẩy vận chuyển' },
  delivered: { id: 'tag-hoan-tat', name: 'Giao thành công' },
  cancelled: { id: 'tag-huy-don', name: 'Đơn hủy' },
  returned: { id: 'tag-don-hoan', name: 'Đơn hoàn' },
};

export function getStatusBadge(status: OrderStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xác nhận', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'confirmed':
      return { label: 'Đã duyệt / Đóng gói', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'shipping':
      return { label: 'Đang giao hàng', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'delivered':
      return { label: 'Đã giao thành công', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'cancelled':
      return { label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'returned':
      return { label: 'Chuyển hoàn', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    default:
      return { label: status, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  }
}

export function getChannelBadge(channel: SalesChannel): { label: string; iconColor: string } {
  switch (channel) {
    case 'facebook':
      return { label: 'Fanpage Messenger', iconColor: 'text-blue-600' };
    case 'livestream':
      return { label: 'Facebook Live', iconColor: 'text-rose-500' };
    case 'tiktok':
      return { label: 'TikTok Shop', iconColor: 'text-black' };
    case 'shopee':
      return { label: 'Shopee', iconColor: 'text-orange-500' };
    case 'pos':
      return { label: 'Tại quầy (POS)', iconColor: 'text-emerald-600' };
    case 'website':
      return { label: 'Website', iconColor: 'text-sky-600' };
    default:
      return { label: channel, iconColor: 'text-gray-600' };
  }
}

export function generateOrderCode(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SON${randomNum}`;
}

export function generateTrackingCode(carrierCode: string): string {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `${carrierCode.toUpperCase()}${randomNum}`;
}

export function generateRoutingSortCode(carrierId: string): string {
  if (carrierId === 'jnt') {
    const zones = ['HAN-CG-01', 'SGN-Q3-02', 'DNG-HC-01', 'SGN-BT-03', 'HAN-HBT-02'];
    return zones[Math.floor(Math.random() * zones.length)];
  }
  if (carrierId === 'best') {
    const hubs = ['HUB-SGN-NORTH', 'HUB-HAN-WEST', 'HUB-DNG-CENTRAL', 'STA-Q1-09'];
    return hubs[Math.floor(Math.random() * hubs.length)];
  }
  return 'VN-ROUTE-01';
}

export function getVietQRUrl(amount: number, memo: string): string {
  const bankId = 'MB';
  const accountNo = '0988999888';
  const accountName = 'NGUYEN VAN THANG - BINBINBOBO';
  const encodedInfo = encodeURIComponent(memo);
  const encodedName = encodeURIComponent(accountName);
  return `https://api.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
}

export const INITIAL_SAVED_ORDER_FILTERS: SavedOrderFilter[] = [
  {
    id: 'filter-all',
    name: 'Tất cả đơn hàng',
    criteria: {},
    isSystem: true,
    createdAt: '2026-11-02T08:00:00Z',
  },
  {
    id: 'filter-pending-pay',
    name: 'Chờ duyệt & Chưa thanh toán',
    criteria: {
      status: 'pending',
      paymentStatus: 'unpaid',
    },
    isSystem: true,
    createdAt: '2026-11-02T08:00:00Z',
  },
  {
    id: 'filter-pack-today',
    name: 'Chờ đóng gói hôm nay',
    criteria: {
      packagingStatus: 'unpacked',
      dateRangePreset: 'today',
    },
    isSystem: true,
    createdAt: '2026-11-02T08:00:00Z',
  },
  {
    id: 'filter-cod-unprinted',
    name: 'Có thu COD chưa in bill',
    criteria: {
      codOption: 'has_cod',
      printStatus: 'unprinted',
    },
    isSystem: true,
    createdAt: '2026-11-02T08:00:00Z',
  },
  {
    id: 'filter-delivered-success',
    name: 'Đã giao thành công',
    criteria: {
      status: 'delivered',
      shippingStatus: 'delivered',
    },
    isSystem: true,
    createdAt: '2026-11-02T08:00:00Z',
  },
];

