export type OrderStatus =
  | 'pending' // Chờ xác nhận
  | 'confirmed' // Đã xác nhận / Chờ đóng gói
  | 'shipping' // Đang giao hàng
  | 'delivered' // Đã giao thành công
  | 'cancelled' // Đã hủy
  | 'returned'; // Chuyển hoàn

export type SalesChannel = 'livestream' | 'facebook' | 'tiktok' | 'shopee' | 'pos' | 'website';

export type PaymentMethod = 'cod' | 'vietqr' | 'cash' | 'card';

export type ShippingCarrierId = 'jnt' | 'best' | 'ghn' | 'ghtk' | 'viettel' | 'ninjavan' | 'spx' | 'ems';

export interface ShippingCarrier {
  id: ShippingCarrierId;
  name: string;
  code: string;
  logoText: string;
  badgeColor: string;
  baseFee: number;
  estimatedDays: string;
  isConnected: boolean;
  authMethod?: 'credentials' | 'api_key';
  username?: string;
  shopId?: string;
  apiKey?: string;
  partnerCode?: string;
  secretKey?: string;
  codBalance?: number;
  defaultPickupShift?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface StaffPermissions {
  // 1. Phân quyền trong Fanpage / Chat
  canChat: boolean;              // Nhắn tin & trả lời khách
  canCloseOrderInChat: boolean;  // Tạo đơn / chốt đơn trực tiếp từ chat
  canManageTags: boolean;        // Gán / gỡ hashtag
  canConnectPages: boolean;      // Kết nối / ngắt kết nối Fanpage
  canUseAiReply: boolean;        // Sử dụng AI gợi ý & chốt đơn
  canTrainAi: boolean;           // Dạy kịch bản máy học AI
  // 2. Phân quyền Đơn hàng
  canViewOrders: boolean;        // Xem danh sách đơn hàng
  canCreateOrder: boolean;       // Tạo đơn hàng mới
  canUpdateOrderStatus: boolean; // Sửa trạng thái đơn hàng
  canPushShipping: boolean;      // Đẩy đơn sang hãng vận chuyển
  canPrintInvoice: boolean;      // In phiếu giao hàng
  canCancelOrder: boolean;       // Hủy đơn hàng
  // 3. Phân quyền Kho hàng & Sản phẩm
  canViewProducts: boolean;      // Xem danh sách sản phẩm & tồn kho
  canStockInBarcode: boolean;    // Nhập kho Barcode
  canEditProduct: boolean;       // Thêm / sửa sản phẩm & giá
  // 4. Phân quyền Vận chuyển, Chi nhánh & Cấu hình
  canManageCarriers: boolean;    // Cấu hình đơn vị vận chuyển
  canManageBranches: boolean;    // Thêm / sửa chi nhánh
  canManageStaff: boolean;       // Quản lý & phân quyền nhân viên
  canViewRevenue: boolean;       // Xem doanh thu & báo cáo
}

export type StaffRole =
  | 'super_admin' // Quản trị viên cấp cao nhất (Super Admin toàn quyền)
  | 'admin'       // Chủ shop / Quản trị viên
  | 'manager'     // Quản lý chi nhánh
  | 'consultant'  // Bán hàng / Tư vấn viên
  | 'warehouse'   // Nhân viên kho
  | 'accountant'  // Kế toán / Đối soát
  | 'custom';     // Tùy biến quyền hạn linh động

export interface StaffMember {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email: string;
  phone: string;
  role: StaffRole;
  roleTitle: string;
  branch: string;
  avatarColor: string;
  avatarInitials: string;
  isOnline: boolean;
  assignedConversationsCount?: number;
  permissions?: StaffPermissions;
  canManagePermissions?: boolean;
}

export interface AiProductScript {
  productId: string;
  productName: string;
  sizeGuide: string;
  sellingPoints: string;
  objectionsHandling: string;
  upsellPitch: string;
  customPrompt?: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isDefault?: boolean;
  managerName?: string;
  city?: string;
  district?: string;
  notes?: string;
}

export type AiProvider = 'gemini' | 'openai' | 'muse';

export interface AiStoreSettings {
  isAutoPilotEnabled: boolean;
  selectedEngine?: AiProvider;
  openaiApiKey?: string;
  openaiModel?: string;
  museApiKey?: string;
  museEndpoint?: string;
  museModel?: string;
  autoPilotCloseOrders?: boolean;
  storeGreeting: string;
  closingRules: string;
  shippingPolicy: string;
  autoTagBot: boolean;
  productScripts: Record<string, AiProductScript>;
}

export interface ProductAttribute {
  id: string;
  name: string; // e.g. "Màu sắc", "Kích thước / Size", "Chất liệu"
  values: string[]; // e.g. ["Đen", "Nâu", "Kem"] or ["36", "37", "38", "39"]
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  title?: string;
  color?: string;
  size?: string;
  attributes?: Record<string, string>; // Dynamic key-values, e.g. { "Màu sắc": "Kem", "Size": "38" }
  stock: number;
  price: number;
  costPrice: number;
  weight?: number; // Khối lượng riêng của phiên bản (gram)
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category: string;
  image: string;
  weight: number; // Khai báo cân nặng sản phẩm (gram, e.g. 350g, 500g)
  length?: number; // Chiều dài (cm)
  width?: number; // Chiều rộng (cm)
  height?: number; // Chiều cao (cm)
  attributes?: ProductAttribute[]; // Các thuộc tính linh động tự định nghĩa
  variants: ProductVariant[];
  basePrice: number;
  costPrice?: number;
  totalStock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  totalOrders: number;
  completedOrders: number;
  returnedOrders: number;
  totalSpent: number;
  isBoomWarning?: boolean;
  notes?: string;
  fanpageSource?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  barcode?: string;
  variantTitle?: string;
  color?: string;
  size?: string;
  attributes?: Record<string, string>;
  image: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  weight?: number; // gram
}

export interface Order {
  id: string;
  code: string; // e.g. SON10023
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  totalWeight: number; // Tổng khối lượng kiện hàng (gram), e.g. 800g
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  channel: SalesChannel;
  status: OrderStatus;
  carrierId: ShippingCarrierId;
  trackingCode: string;
  branch: string;
  sourcePageName?: string;
  noteForShipper?: string;
  internalNote?: string;
  sortCode?: string; // Routing code e.g. SGN-Q3-01 for J&T / Best
  pushedAt?: string;
  isPrinted?: boolean;
  packagingStatus?: 'unpacked' | 'packed' | 'ready_to_pack';
  shippingStatus?: 'waiting_pickup' | 'delivering' | 'delivered' | 'failed' | 'not_pushed' | 'pushed_to_carrier';
  warehouseExportStatus?: 'unexported' | 'exported';
  orderProcessingStatus?: 'pending' | 'processing' | 'completed';
  createdByStaffName?: string;
  assignedStaffName?: string;
  approvedAt?: string;
  expectedDeliveryAt?: string;
  completedAt?: string;
}

export interface OrderFilterCriteria {
  searchQuery?: string;
  branch?: string;
  productId?: string;
  createdByStaff?: string;
  assignedStaff?: string;
  customerPhone?: string;
  carrierId?: string;
  status?: string;
  paymentStatus?: 'all' | 'paid' | 'unpaid' | 'partially_paid';
  packagingStatus?: 'all' | 'unpacked' | 'packed';
  shippingStatus?: 'all' | 'waiting_pickup' | 'delivering' | 'delivered' | 'failed';
  printStatus?: 'all' | 'printed' | 'unprinted';
  dateRangePreset?: 'all' | 'today' | 'yesterday' | '7days' | '30days' | '90days' | 'custom';
  startDate?: string;
  endDate?: string;
  recordDate?: string;
  approvedDate?: string;
  expectedDeliveryDate?: string;
  completedDate?: string;
  cancelledDate?: string;
  channel?: string;
  expectedPayment?: string;
  codOption?: 'all' | 'has_cod' | 'no_cod' | 'cod_above_500k';
  warehouseExportStatus?: 'all' | 'exported' | 'unexported';
  orderProcessingStatus?: 'all' | 'pending' | 'processing' | 'completed';
  minTotal?: number;
  maxTotal?: number;
  minWeight?: number;
  maxWeight?: number;
  boomRiskOnly?: boolean;
  productTag?: string;
}

export interface SavedOrderFilter {
  id: string;
  name: string;
  criteria: OrderFilterCriteria;
  isSystem?: boolean;
  createdAt: string;
}

export interface Fanpage {
  id: string;
  name: string;
  pageId: string;
  category: string;
  avatarColor: string;
  avatarInitials: string;
  isConnected: boolean;
  autoHideCommentWithPhone: boolean;
  autoReplyComment: boolean;
  conversationsCount: number;
  followersCount: number;
}

export interface HashtagLabel {
  id: string;
  name: string;
  color: string; // Tailwind dot / bg indicator
  bgColor: string;
  textColor: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'shop';
  text: string;
  time: string;
  image?: string;
  isPhoneExtracted?: boolean;
}

export interface Conversation {
  id: string;
  pageId: string;
  pageName: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerAvatarColor: string;
  customerAvatarInitials: string;
  lastMessage: string;
  lastMessageTime: string;
  type: 'message' | 'comment';
  unreadCount: number;
  hasPhone: boolean;
  hasOrder: boolean;
  tags: string[]; // List of HashtagLabel IDs
  isBusinessAgentActive: boolean;
  notes?: string;
  messages: ChatMessage[];
  facebookProfileUrl?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  autoRepliedByBot?: boolean;
}

export interface StockInItem {
  barcode: string;
  sku: string;
  productName: string;
  color?: string;
  size?: string;
  quantity: number;
  costPrice: number;
  total?: number;
}

export interface StockInTicket {
  id: string;
  code: string; // e.g. PNK1001
  createdAt: string;
  supplier?: string;
  supplierName?: string;
  branch: string;
  items: StockInItem[];
  totalQuantity?: number;
  totalItems?: number;
  totalCost?: number;
  totalAmount?: number;
  note?: string;
  status?: string;
}

export interface LiveComment {
  id: string;
  authorName: string;
  avatarColor: string;
  avatarInitials: string;
  content: string;
  timestamp: string;
  extractedPhone?: string;
  matchedSku?: string;
  matchedSize?: string;
  matchedColor?: string;
  isValidSyntax: boolean;
  isClosed: boolean;
  customerRisk?: 'normal' | 'loyal' | 'warning_boom';
}

export type QuickReplyCategory =
  | 'chao_hoi'      // Chào hỏi & mở đầu
  | 'xin_thong_tin' // Xin SĐT, địa chỉ giao hàng
  | 'thanh_toan'    // STK ngân hàng, VietQR
  | 'van_chuyen'    // Thời gian giao, phí ship, kiểm tra hàng
  | 'khuyen_mai'    // Voucher, ưu đãi số lượng
  | 'tu_van_size'   // Bảng chọn size, màu sắc
  | 'khac';         // Khác

export interface QuickReplyTemplate {
  id: string;
  shortcut: string;     // e.g. "/chao", "/sdt", "/stk", "/ship"
  title: string;        // e.g. "Chào khách mới", "Xin SĐT & Địa chỉ"
  content: string;      // The template message text
  category: QuickReplyCategory;
  usageCount?: number;
  shortcutKey?: string; // Optional numeric key e.g. "1", "2"
}

