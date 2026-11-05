import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Printer,
  Download,
  Upload,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Calendar,
  Package,
  Scale,
  Send,
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
  Check,
  AlertTriangle,
  Receipt,
  FileText,
  Bookmark,
  BookmarkPlus,
  HelpCircle,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  Product,
  SalesChannel,
  ShippingCarrier,
  Branch,
  StaffMember,
  Customer,
  OrderFilterCriteria,
  SavedOrderFilter,
} from '../types';
import {
  formatVND,
  formatDate,
  getStatusBadge,
  getChannelBadge,
} from '../utils/formatters';
import { OrderFilterDrawer } from './OrderFilterDrawer';

interface OrdersListViewProps {
  orders: Order[];
  products?: Product[];
  branches?: Branch[];
  staffList?: StaffMember[];
  customers?: Customer[];
  carriers?: ShippingCarrier[];
  savedFilters?: SavedOrderFilter[];
  onSaveFilter?: (name: string, criteria: OrderFilterCriteria) => void;
  onDeleteSavedFilter?: (id: string) => void;
  onViewOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onPrintBulkOrders?: (orders: Order[]) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onBulkPushOrders?: (orderIds: string[], carrierId: string, results: any[]) => void;
  onOpenCreateOrder: () => void;
  initialFilterStatus?: OrderStatus | 'all';
  onOpenShippingCarriers?: () => void;
  onOpenCodReconciliation?: () => void;
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({
  orders,
  products = [],
  branches = [],
  staffList = [],
  customers = [],
  carriers = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteSavedFilter,
  onViewOrder,
  onPrintOrder,
  onPrintBulkOrders,
  onUpdateOrderStatus,
  onBulkPushOrders,
  onOpenCreateOrder,
  initialFilterStatus = 'all',
  onOpenShippingCarriers,
  onOpenCodReconciliation,
}) => {
  // Filter Drawer & Criteria State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<OrderFilterCriteria>({
    status: initialFilterStatus !== 'all' ? initialFilterStatus : undefined,
  });

  // Top Search & Quick Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [quickDatePreset, setQuickDatePreset] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days' | '90days'>('all');
  const [quickStatus, setQuickStatus] = useState<string>('all');
  const [quickStaff, setQuickStaff] = useState<string>('all');
  const [quickSavedFilterId, setQuickSavedFilterId] = useState<string>('');

  // Quick Product Tag bar (Matching Image 2: "Tất cả đơn hàng", "Đang giao dịch", "kính ram", "mũ câu cá", etc.)
  const [selectedTagPill, setSelectedTagPill] = useState<string>('all');

  // Row selection
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for File import & Tax advice
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTaxAdviceModal, setShowTaxAdviceModal] = useState(false);

  // Bulk push modal
  const [showBulkPushModal, setShowBulkPushModal] = useState(false);
  const [bulkCarrier, setBulkCarrier] = useState<string>('jnt');
  const [pickupShift, setPickupShift] = useState('Ca chiều (13h - 18h)');
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccessResult, setPushSuccessResult] = useState<{
    count: number;
    carrierName: string;
    totalWeight: number;
  } | null>(null);

  // Default quick product tags matching Image 2
  const quickProductPills = [
    { id: 'all', label: 'Tất cả đơn hàng' },
    { id: 'active', label: 'Đang giao dịch' },
    { id: 'kính ram', label: 'kính ram' },
    { id: 'mũ câu cá', label: 'mũ câu cá' },
    { id: 'dép đế cao', label: 'dép đế cao' },
    { id: 'dép miu', label: 'dép miu' },
    { id: 'siết eo', label: 'siết eo' },
    { id: 'chấm bi', label: 'chấm bi' },
    { id: 'thổ cẩm', label: 'thổ cẩm' },
    { id: 'ôm dáng', label: 'ôm dáng' },
    { id: 'kính đổi màu 3in1', label: 'kính đổi màu 3in1' },
    { id: 'bra', label: 'bra' },
    { id: 'chuốt mi', label: 'chuốt mi' },
    { id: 'giả váy', label: 'giả váy' },
    { id: 'bờm', label: 'bờm' },
  ];

  // Helper to check stock readiness for an order
  const checkOrderStock = (ord: Order) => {
    let isFullyInStock = true;
    const itemsWithStock = ord.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId || p.name === it.productName);
      const variant = prod?.variants.find((v) => v.id === it.variantId || v.sku === it.sku);
      const stock = variant ? variant.stock : 30;
      const isAvailable = stock >= it.quantity;
      if (!isAvailable) isFullyInStock = false;
      return {
        ...it,
        stock,
        isAvailable,
      };
    });
    return { isFullyInStock, itemsWithStock };
  };

  // Metrics Bar Computations (Matching Image 2: "ĐƠN HÀNG CẦN XỬ LÝ [90 ngày gần nhất v]")
  const metrics = useMemo(() => {
    const choDuyet = orders.filter((o) => o.status === 'pending');
    const choThanhToan = orders.filter((o) => !o.isPaid && o.status !== 'cancelled' && o.status !== 'returned');
    const choDongGoi = orders.filter((o) => o.status === 'confirmed');
    const choLayHang = orders.filter((o) => o.status === 'shipping' && (!o.shippingStatus || o.shippingStatus === 'waiting_pickup'));
    const dangGiaoHang = orders.filter((o) => o.status === 'shipping');

    const sumAmount = (list: Order[]) => list.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      choDuyet: { count: choDuyet.length, amount: sumAmount(choDuyet) },
      choThanhToan: { count: choThanhToan.length, amount: sumAmount(choThanhToan) },
      choDongGoi: { count: choDongGoi.length, amount: sumAmount(choDongGoi) },
      choLayHang: { count: choLayHang.length, amount: sumAmount(choLayHang) },
      dangGiaoHang: { count: dangGiaoHang.length, amount: sumAmount(dangGiaoHang) },
    };
  }, [orders]);

  // Master Filter Engine: applies quick filters + drawer criteria + pill tags + search
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Keyword search (Mã đơn, vận đơn, tên khách, SĐT)
      const q = (searchKeyword || filterCriteria.searchQuery || '').trim().toLowerCase();
      if (q) {
        const matchCode = ord.code.toLowerCase().includes(q);
        const matchPhone = ord.customer.phone.includes(q);
        const matchName = ord.customer.name.toLowerCase().includes(q);
        const matchTracking = ord.trackingCode?.toLowerCase().includes(q);
        const matchItemSku = ord.items.some((it) => it.sku.toLowerCase().includes(q) || it.productName.toLowerCase().includes(q));
        if (!matchCode && !matchPhone && !matchName && !matchTracking && !matchItemSku) return false;
      }

      // 2. Quick Pill Tag
      if (selectedTagPill !== 'all') {
        if (selectedTagPill === 'active') {
          if (ord.status === 'delivered' || ord.status === 'cancelled' || ord.status === 'returned') return false;
        } else {
          const tagLower = selectedTagPill.toLowerCase();
          const matchesItem = ord.items.some((it) => it.productName.toLowerCase().includes(tagLower) || it.sku.toLowerCase().includes(tagLower));
          if (!matchesItem) return false;
        }
      }

      // 3. Quick Status or Drawer Status
      const statusToFilter = filterCriteria.status || (quickStatus !== 'all' ? quickStatus : undefined);
      if (statusToFilter && statusToFilter !== 'all') {
        if (statusToFilter === 'returned') {
          if (ord.status !== 'returned' && ord.status !== 'cancelled') return false;
        } else if (ord.status !== statusToFilter) {
          return false;
        }
      }

      // 4. Quick Date or Drawer Date
      const datePreset = filterCriteria.dateRangePreset || (quickDatePreset !== 'all' ? quickDatePreset : undefined);
      if (datePreset && datePreset !== 'all') {
        if (datePreset === 'today') {
          if (!ord.createdAt.startsWith('2026-11-02')) return false;
        } else if (datePreset === 'yesterday') {
          if (!ord.createdAt.startsWith('2026-11-01')) return false;
        } else if (datePreset === '7days') {
          if (!ord.createdAt.startsWith('2026-11') && !ord.createdAt.startsWith('2026-10-3')) return false;
        }
      }

      // 5. Quick Staff or Drawer Staff
      const staffToFilter = filterCriteria.assignedStaff || (quickStaff !== 'all' ? quickStaff : undefined);
      if (staffToFilter && staffToFilter !== 'all') {
        if (ord.assignedStaffName !== staffToFilter && ord.createdByStaffName !== staffToFilter) {
          // If order doesn't have assigned staff name, match by general staff
          return false;
        }
      }

      // 6. Drawer Criteria: Chi nhánh tạo đơn
      if (filterCriteria.branch && ord.branch !== filterCriteria.branch) {
        return false;
      }

      // 7. Drawer Criteria: Sản phẩm
      if (filterCriteria.productId) {
        const hasProd = ord.items.some((it) => it.productId === filterCriteria.productId);
        if (!hasProd) return false;
      }

      // 8. Drawer Criteria: Khách hàng
      if (filterCriteria.customerPhone && ord.customer.phone !== filterCriteria.customerPhone) {
        return false;
      }

      // 9. Drawer Criteria: Đối tác vận chuyển
      if (filterCriteria.carrierId && ord.carrierId !== filterCriteria.carrierId) {
        return false;
      }

      // 10. Drawer Criteria: Trạng thái thanh toán
      if (filterCriteria.paymentStatus && filterCriteria.paymentStatus !== 'all') {
        if (filterCriteria.paymentStatus === 'paid' && !ord.isPaid) return false;
        if (filterCriteria.paymentStatus === 'unpaid' && ord.isPaid) return false;
      }

      // 11. Drawer Criteria: Trạng thái đóng gói
      if (filterCriteria.packagingStatus && filterCriteria.packagingStatus !== 'all') {
        if (filterCriteria.packagingStatus === 'packed' && ord.packagingStatus !== 'packed') return false;
        if (filterCriteria.packagingStatus === 'unpacked' && ord.packagingStatus === 'packed') return false;
      }

      // 12. Drawer Criteria: Trạng thái giao hàng
      if (filterCriteria.shippingStatus && filterCriteria.shippingStatus !== 'all') {
        if (ord.shippingStatus && ord.shippingStatus !== filterCriteria.shippingStatus) return false;
      }

      // 13. Drawer Criteria: Trạng thái in hóa đơn
      if (filterCriteria.printStatus && filterCriteria.printStatus !== 'all') {
        if (filterCriteria.printStatus === 'printed' && !ord.isPrinted) return false;
        if (filterCriteria.printStatus === 'unprinted' && ord.isPrinted) return false;
      }

      // 14. Drawer Criteria: Nguồn bán hàng
      if (filterCriteria.channel && filterCriteria.channel !== 'all' && ord.channel !== filterCriteria.channel) {
        return false;
      }

      // 15. Drawer Criteria: Thu hộ COD
      if (filterCriteria.codOption && filterCriteria.codOption !== 'all') {
        const isCod = ord.paymentMethod === 'cod' && !ord.isPaid;
        if (filterCriteria.codOption === 'has_cod' && !isCod) return false;
        if (filterCriteria.codOption === 'no_cod' && isCod) return false;
        if (filterCriteria.codOption === 'cod_above_500k' && (!isCod || ord.totalAmount <= 500000)) return false;
      }

      // 16. Drawer Criteria: Trạng thái xuất kho
      if (filterCriteria.warehouseExportStatus && filterCriteria.warehouseExportStatus !== 'all') {
        if (filterCriteria.warehouseExportStatus === 'exported' && ord.warehouseExportStatus !== 'exported') return false;
        if (filterCriteria.warehouseExportStatus === 'unexported' && ord.warehouseExportStatus === 'exported') return false;
      }

      // 17. Custom Extensions: Giá trị đơn hàng (VNĐ)
      if (filterCriteria.minTotal && ord.totalAmount < filterCriteria.minTotal) return false;
      if (filterCriteria.maxTotal && ord.totalAmount > filterCriteria.maxTotal) return false;

      // 18. Custom Extensions: Khối lượng (gram)
      const weight = ord.totalWeight || 400;
      if (filterCriteria.minWeight && weight < filterCriteria.minWeight) return false;
      if (filterCriteria.maxWeight && weight > filterCriteria.maxWeight) return false;

      // 19. Custom Extensions: Cảnh báo bom hàng
      if (filterCriteria.boomRiskOnly && !ord.customer.isBoomWarning) return false;

      return true;
    });
  }, [orders, searchKeyword, filterCriteria, selectedTagPill, quickStatus, quickDatePreset, quickStaff]);

  // Active filter count in drawer
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filterCriteria).forEach(([k, v]) => {
      if (v !== undefined && v !== 'all' && v !== '' && v !== false) count++;
    });
    return count;
  }, [filterCriteria]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Quick batch selector buttons: 20, 50, 100, 200, 500
  const handleSelectBatch = (count: number) => {
    const ids = filteredOrders.slice(0, count).map((o) => o.id);
    setSelectedOrders(ids);
    setToastMessage(`Đã chọn nhanh ${ids.length} đơn hàng!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Actions for selected orders (Duyệt, Thanh toán, Hủy, In)
  const handleBatchApprove = () => {
    if (selectedOrders.length === 0) return;
    selectedOrders.forEach((id) => onUpdateOrderStatus(id, 'confirmed'));
    setToastMessage(`Đã duyệt thành công ${selectedOrders.length} đơn hàng!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBatchQuickPay = () => {
    if (selectedOrders.length === 0) return;
    selectedOrders.forEach((id) => {
      const ord = orders.find((o) => o.id === id);
      if (ord) ord.isPaid = true;
    });
    setToastMessage(`Đã đánh dấu đã thanh toán cho ${selectedOrders.length} đơn hàng!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBatchCancel = () => {
    if (selectedOrders.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn hủy ${selectedOrders.length} đơn hàng đã chọn?`)) {
      selectedOrders.forEach((id) => onUpdateOrderStatus(id, 'cancelled'));
      setSelectedOrders([]);
      setToastMessage(`Đã hủy ${selectedOrders.length} đơn hàng!`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleBatchPrint = () => {
    if (selectedOrders.length === 0) return;
    const selectedObjs = orders.filter((o) => selectedOrders.includes(o.id));
    if (onPrintBulkOrders) {
      onPrintBulkOrders(selectedObjs);
    } else {
      onPrintOrder(selectedObjs[0]);
    }
  };

  // Bulk push
  const selectedOrderObjects = orders.filter((o) => selectedOrders.includes(o.id));
  const totalSelectedCod = selectedOrderObjects.reduce((sum, o) => sum + (o.isPaid ? 0 : o.totalAmount), 0);
  const totalSelectedWeight = selectedOrderObjects.reduce((sum, o) => sum + (o.totalWeight || 400), 0);

  const handleExecuteBulkPush = async () => {
    if (selectedOrders.length === 0) return;
    setIsPushing(true);

    try {
      const res = await fetch('/api/carriers/bulk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierId: bulkCarrier,
          orders: selectedOrderObjects,
          pickupShift,
        }),
      });

      const data = await res.json();
      if (data.success && data.results) {
        if (onBulkPushOrders) {
          onBulkPushOrders(selectedOrders, bulkCarrier, data.results);
        } else {
          selectedOrders.forEach((id) => onUpdateOrderStatus(id, 'shipping'));
        }

        const targetCarrierObj = carriers.find((c) => c.id === bulkCarrier);
        setPushSuccessResult({
          count: data.pushedCount,
          carrierName: targetCarrierObj?.name || bulkCarrier.toUpperCase(),
          totalWeight: data.totalWeight,
        });

        setSelectedOrders([]);
      }
    } catch (err) {
      console.error('Bulk push failed:', err);
    } finally {
      setIsPushing(false);
    }
  };

  const handleBatchExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      ['Mã đơn,Khách hàng,Số điện thoại,Địa chỉ,Tổng tiền,Khối lượng(g),Vận đơn,Đơn vị VC,Trạng thái,Ngày tạo']
        .concat(
          filteredOrders.map(
            (o) =>
              `${o.code},"${o.customer.name}",${o.customer.phone},"${o.customer.address}, ${o.customer.city}",${o.totalAmount},${o.totalWeight || 400},${o.trackingCode || 'Chưa đẩy'},${o.carrierId.toUpperCase()},${o.status},"${o.createdAt}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Achat_DonHang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 pb-12 text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Row 1: Top Bar matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#0F172A]">Danh sách đơn hàng</h1>
          <span className="text-xs text-[#64748B]">({filteredOrders.length} đơn)</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBatchExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất file</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Nhập file</span>
          </button>

          <button
            onClick={() => setShowTaxAdviceModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Tư vấn thuế</span>
          </button>

          <button
            onClick={onOpenCreateOrder}
            className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tạo đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Row 2: Metrics Summary Card matching Image 2: "ĐƠN HÀNG CẦN XỬ LÝ [90 ngày gần nhất v]" */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[#0F172A] tracking-wider uppercase">
              Đơn hàng cần xử lý
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0088FF] cursor-pointer hover:underline">
              <span>90 ngày gần nhất</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>
          <span className="text-[11px] text-[#64748B]">Bấm vào từng ô để lọc nhanh</span>
        </div>

        {/* 5 Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Chờ duyệt */}
          <button
            onClick={() => {
              setQuickStatus('pending');
              setFilterCriteria({ ...filterCriteria, status: 'pending' });
            }}
            className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${
              filterCriteria.status === 'pending'
                ? 'border-[#0088FF] bg-[#EFF6FF] ring-2 ring-[#0088FF]/30'
                : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#64748B] text-[11px] font-medium">
              <span>Chờ duyệt</span>
              <span className="rounded-full bg-blue-100 text-[#0088FF] font-bold px-1.5 py-0.2 text-[10px]">
                {metrics.choDuyet.count}
              </span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-[#0F172A]">
              {formatVND(metrics.choDuyet.amount)}
            </div>
          </button>

          {/* 2. Chờ thanh toán */}
          <button
            onClick={() => {
              setFilterCriteria({ ...filterCriteria, paymentStatus: 'unpaid' });
            }}
            className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${
              filterCriteria.paymentStatus === 'unpaid'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/30'
                : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#64748B] text-[11px] font-medium">
              <span>Chờ thanh toán</span>
              <span className="rounded-full bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 text-[10px]">
                {metrics.choThanhToan.count}
              </span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-[#0F172A]">
              {formatVND(metrics.choThanhToan.amount)}
            </div>
          </button>

          {/* 3. Chờ đóng gói */}
          <button
            onClick={() => {
              setQuickStatus('confirmed');
              setFilterCriteria({ ...filterCriteria, status: 'confirmed', packagingStatus: 'unpacked' });
            }}
            className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${
              filterCriteria.status === 'confirmed'
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-400/30'
                : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#64748B] text-[11px] font-medium">
              <span>Chờ đóng gói</span>
              <span className="rounded-full bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 text-[10px]">
                {metrics.choDongGoi.count}
              </span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-[#0F172A]">
              {formatVND(metrics.choDongGoi.amount)}
            </div>
          </button>

          {/* 4. Chờ lấy hàng */}
          <button
            onClick={() => {
              setFilterCriteria({ ...filterCriteria, shippingStatus: 'waiting_pickup' });
            }}
            className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${
              filterCriteria.shippingStatus === 'waiting_pickup'
                ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-400/30'
                : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#64748B] text-[11px] font-medium">
              <span>Chờ lấy hàng</span>
              <span className="rounded-full bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.2 text-[10px]">
                {metrics.choLayHang.count}
              </span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-[#0F172A]">
              {formatVND(metrics.choLayHang.amount)}
            </div>
          </button>

          {/* 5. Đang giao hàng */}
          <button
            onClick={() => {
              setQuickStatus('shipping');
              setFilterCriteria({ ...filterCriteria, status: 'shipping' });
            }}
            className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${
              filterCriteria.status === 'shipping' && !filterCriteria.shippingStatus
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/30'
                : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#64748B] text-[11px] font-medium">
              <span>Đang giao hàng</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 text-[10px]">
                {metrics.dangGiaoHang.count}
              </span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-[#0F172A]">
              {formatVND(metrics.dangGiaoHang.amount)}
            </div>
          </button>
        </div>
      </div>

      {/* Row 3: Quick Tag Pills matching Image 2 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar border-b border-[#E2E8F0]">
        {quickProductPills.map((pill) => {
          const isActive = selectedTagPill === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setSelectedTagPill(pill.id)}
              className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#0088FF] text-white font-bold shadow-xs'
                  : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Row 4: Search & Quick Filters Bar with "Bộ lọc" Drawer trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-2xs">
        {/* Search input matching Image 2 placeholder */}
        <div className="flex-1 flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs">
          <Search className="h-4 w-4 text-[#94A3B8] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, vận đơn, tên, SĐT khách hàng / người nhận hàng"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-transparent outline-none text-[#0F172A] placeholder-[#94A3B8]"
          />
          {searchKeyword && (
            <button onClick={() => setSearchKeyword('')} className="text-[#94A3B8] hover:text-[#334155]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ngày tạo */}
          <div className="flex items-center border border-[#CBD5E1] bg-white rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-[#64748B] mr-1">Ngày tạo:</span>
            <select
              value={quickDatePreset}
              onChange={(e) => {
                const val = e.target.value as any;
                setQuickDatePreset(val);
                setFilterCriteria((prev) => ({ ...prev, dateRangePreset: val }));
              }}
              className="bg-transparent font-semibold text-[#0F172A] outline-none cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày gần nhất</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div className="flex items-center border border-[#CBD5E1] bg-white rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-[#64748B] mr-1">Trạng thái:</span>
            <select
              value={quickStatus}
              onChange={(e) => {
                const val = e.target.value;
                setQuickStatus(val);
                setFilterCriteria((prev) => ({ ...prev, status: val }));
              }}
              className="bg-transparent font-semibold text-[#0F172A] outline-none cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã lên đơn (Chờ gói)</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="delivered">Đã giao thành công</option>
              <option value="returned">Chuyển hoàn / Hủy</option>
            </select>
          </div>

          {/* Nhân viên phụ trách */}
          {staffList.length > 0 && (
            <div className="hidden lg:flex items-center border border-[#CBD5E1] bg-white rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-[#64748B] mr-1">Nhân viên:</span>
              <select
                value={quickStaff}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickStaff(val);
                  setFilterCriteria((prev) => ({ ...prev, assignedStaff: val !== 'all' ? val : undefined }));
                }}
                className="bg-transparent font-semibold text-[#0F172A] outline-none cursor-pointer max-w-28 truncate"
              >
                <option value="all">Tất cả</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mẫu bộ lọc đã lưu (Saved Filter Preset selector) */}
          {savedFilters.length > 0 && (
            <div className="flex items-center border border-blue-200 bg-blue-50/50 rounded-lg px-2.5 py-1.5 text-xs text-[#0088FF]">
              <Bookmark className="h-3.5 w-3.5 mr-1 text-[#0088FF]" />
              <select
                value={quickSavedFilterId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setQuickSavedFilterId(sId);
                  const found = savedFilters.find((f) => f.id === sId);
                  if (found) {
                    setFilterCriteria(found.criteria);
                    if (found.criteria.status) setQuickStatus(found.criteria.status);
                    if (found.criteria.dateRangePreset) setQuickDatePreset(found.criteria.dateRangePreset as any);
                    setToastMessage(`Đã áp dụng mẫu: "${found.name}"`);
                    setTimeout(() => setToastMessage(null), 2500);
                  }
                }}
                className="bg-transparent font-bold text-[#0088FF] outline-none cursor-pointer max-w-36 truncate"
              >
                <option value="">Mẫu lọc đã lưu...</option>
                {savedFilters.map((sf) => (
                  <option key={sf.id} value={sf.id}>
                    {sf.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bộ lọc Button (Opens Filter Drawer) */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-[#0088FF] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-white text-[#0088FF] text-[10px] font-black px-1.5 py-0.2">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 5: Batch Action Bar (matching Image 2: "Đã chọn N đơn hàng trên trang này", Duyệt, Thanh toán, In, Hủy) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E293B]">
            <input
              type="checkbox"
              checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-[#0088FF] focus:ring-[#0088FF]"
            />
            <span>
              {selectedOrders.length > 0
                ? `Đã chọn ${selectedOrders.length} đơn hàng trên trang này`
                : 'Chọn đơn để xử lý hàng loạt:'}
            </span>
          </label>

          {/* Quick batch selectors requested by user */}
          <div className="hidden md:flex items-center gap-1 border-l border-blue-200 pl-3">
            <span className="text-[11px] text-[#64748B]">Chọn nhanh:</span>
            {[20, 50, 100, 200, 500].map((num) => (
              <button
                key={num}
                onClick={() => handleSelectBatch(num)}
                className="rounded bg-white border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-[#0088FF] hover:bg-blue-100 transition-colors cursor-pointer"
              >
                {num} đơn
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons matching Image 2 */}
        {selectedOrders.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleBatchApprove}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Duyệt đơn</span>
            </button>

            <button
              onClick={handleBatchQuickPay}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Thanh toán nhanh</span>
            </button>

            <button
              onClick={handleBatchPrint}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In hóa đơn ({selectedOrders.length})</span>
            </button>

            <button
              onClick={() => setShowBulkPushModal(true)}
              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Gom đẩy ĐVVC</span>
            </button>

            <button
              onClick={handleBatchCancel}
              className="rounded-lg bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold px-2.5 py-1 text-xs transition-colors"
            >
              Hủy đơn
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-[#64748B]">
            Chọn các đơn hàng cần đóng gói hoặc in phiếu để thực hiện thao tác nhanh
          </div>
        )}
      </div>

      {/* Row 6: Main Orders Table matching Image 2 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] select-none">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-[#0088FF]"
                  />
                </th>
                <th className="p-3 font-bold text-[#1E293B]">Mã đơn</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3">Khách hàng</th>
                <th className="p-3">Chi nhánh</th>
                <th className="p-3">Trạng thái đơn</th>
                <th className="p-3">Thanh toán</th>
                <th className="p-3 text-right">Tổng tiền</th>
                <th className="p-3">Vận chuyển</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#94A3B8]">
                    <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Không tìm thấy đơn hàng nào phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Thử điều chỉnh từ khóa tìm kiếm hoặc xóa bớt tiêu chí trong bộ lọc.
                    </p>
                    <button
                      onClick={() => {
                        setSearchKeyword('');
                        setSelectedTagPill('all');
                        setQuickStatus('all');
                        setQuickDatePreset('all');
                        setQuickStaff('all');
                        setFilterCriteria({});
                      }}
                      className="mt-3 rounded-lg bg-blue-50 text-[#0088FF] px-3 py-1.5 font-bold hover:bg-blue-100 transition-colors"
                    >
                      Xóa toàn bộ bộ lọc
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isChecked = selectedOrders.includes(ord.id);
                  const { isFullyInStock } = checkOrderStock(ord);

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        isChecked ? 'bg-[#EFF6FF]' : ''
                      }`}
                      onClick={() => onViewOrder(ord)}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOrder(ord.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0088FF]"
                        />
                      </td>

                      {/* Mã đơn */}
                      <td className="p-3 font-mono font-bold text-[#0088FF]">
                        <div className="flex items-center gap-1.5">
                          <span>{ord.code}</span>
                          {ord.isPrinted && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-sans" title="Đã in bill">
                              Đã in
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ngày tạo */}
                      <td className="p-3 text-[#64748B] whitespace-nowrap">
                        {formatDate(ord.createdAt)}
                      </td>

                      {/* Khách hàng */}
                      <td className="p-3">
                        <div className="font-semibold text-[#1E293B]">{ord.customer.name}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">{ord.customer.phone}</div>
                        {ord.customer.isBoomWarning && (
                          <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 rounded mt-0.5">
                            ⚠️ Cảnh báo bom hàng
                          </span>
                        )}
                      </td>

                      {/* Chi nhánh */}
                      <td className="p-3 text-[#64748B] max-w-[130px] truncate" title={ord.branch}>
                        {ord.branch || 'Kho Tổng TP.HCM'}
                      </td>

                      {/* Trạng thái đơn hàng */}
                      <td className="p-3">
                        {(() => {
                          const badge = getStatusBadge(ord.status);
                          return (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Trạng thái thanh toán */}
                      <td className="p-3">
                        {ord.isPaid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" />
                            Chưa thanh toán
                          </span>
                        )}
                      </td>

                      {/* Tổng tiền */}
                      <td className="p-3 text-right font-mono font-bold text-[#0F172A]">
                        {formatVND(ord.totalAmount)}
                      </td>

                      {/* Đơn vị vận chuyển */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-semibold text-[#334155]">
                          <Truck className="h-3.5 w-3.5 text-[#0088FF]" />
                          <span>{ord.carrierId.toUpperCase()}</span>
                        </div>
                        {ord.trackingCode ? (
                          <span className="text-[10px] font-mono text-[#0088FF] hover:underline">
                            {ord.trackingCode}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600">Chưa đẩy vận đơn</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewOrder(ord)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-[#0088FF] hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onPrintOrder(ord)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="In hóa đơn / Phiếu giao hàng"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Order Filter Drawer (Matches Image 1 & 2) */}
      <OrderFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        criteria={filterCriteria}
        onChangeCriteria={setFilterCriteria}
        onApply={() => {
          if (filterCriteria.status) setQuickStatus(filterCriteria.status);
          if (filterCriteria.dateRangePreset) setQuickDatePreset(filterCriteria.dateRangePreset as any);
          if (filterCriteria.assignedStaff) setQuickStaff(filterCriteria.assignedStaff);
          setIsFilterDrawerOpen(false);
        }}
        onReset={() => {
          setFilterCriteria({});
          setQuickStatus('all');
          setQuickDatePreset('all');
          setQuickStaff('all');
          setSearchKeyword('');
          setSelectedTagPill('all');
        }}
        branches={branches}
        products={products}
        staffList={staffList}
        customers={customers}
        carriers={carriers}
        savedFilters={savedFilters}
        onSaveFilter={onSaveFilter || (() => {})}
        onDeleteSavedFilter={onDeleteSavedFilter || (() => {})}
        onApplySavedFilter={(sf) => {
          setFilterCriteria(sf.criteria);
          if (sf.criteria.status) setQuickStatus(sf.criteria.status);
          if (sf.criteria.dateRangePreset) setQuickDatePreset(sf.criteria.dateRangePreset as any);
          setQuickSavedFilterId(sf.id);
          setIsFilterDrawerOpen(false);
          setToastMessage(`Đã áp dụng mẫu lọc: "${sf.name}"`);
          setTimeout(() => setToastMessage(null), 2500);
        }}
        totalFilteredCount={filteredOrders.length}
      />

      {/* Modal: Bulk Push Carrier */}
      {showBulkPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#0088FF]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Gom đẩy {selectedOrders.length} đơn sang Hãng Vận Chuyển
                </h3>
              </div>
              <button onClick={() => setShowBulkPushModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-semibold text-[#334155] block mb-1">
                  Chọn đơn vị vận chuyển nhận hàng:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {carriers.filter((c) => c.isConnected).map((car) => (
                    <button
                      key={car.id}
                      onClick={() => setBulkCarrier(car.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        bulkCarrier === car.id
                          ? 'border-[#0088FF] bg-blue-50/70 font-bold text-[#0088FF]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{car.name}</span>
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border">
                        {car.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#334155] block mb-1">
                  Chọn ca lấy hàng của bưu tá:
                </label>
                <select
                  value={pickupShift}
                  onChange={(e) => setPickupShift(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs"
                >
                  <option value="Ca sáng (08h - 12h)">Ca sáng (08h - 12h)</option>
                  <option value="Ca chiều (13h - 18h)">Ca chiều (13h - 18h)</option>
                  <option value="Ca tối (18h - 21h)">Ca tối (18h - 21h)</option>
                </select>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 space-y-1 text-[#64748B]">
                <div className="flex justify-between">
                  <span>Số lượng đơn:</span>
                  <strong className="text-slate-800">{selectedOrders.length} kiện</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tổng khối lượng tạm tính:</span>
                  <strong className="text-slate-800">{(totalSelectedWeight / 1000).toFixed(2)} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tổng tiền thu hộ COD:</span>
                  <strong className="text-emerald-700">{formatVND(totalSelectedCod)}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowBulkPushModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleExecuteBulkPush}
                  disabled={isPushing}
                  className="rounded-lg bg-[#0088FF] px-5 py-2 font-bold text-white hover:bg-[#0077E6] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPushing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang đẩy đơn...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Xác nhận đẩy {selectedOrders.length} đơn</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tax Advice (Tư vấn thuế Achat) */}
      {showTaxAdviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Tư vấn thuế &amp; Hóa đơn điện tử Achat
                </h3>
              </div>
              <button onClick={() => setShowTaxAdviceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
              <p>
                Theo <strong>Nghị định 123/2020/NĐ-CP</strong> và <strong>Thông tư 78/2021/TT-BTC</strong>, các cơ sở kinh doanh bán lẻ, livestream và thương mại điện tử cần đồng bộ dữ liệu hóa đơn điện tử khởi tạo từ máy tính tiền.
              </p>
              <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 space-y-1.5">
                <div className="font-bold text-indigo-900">Tính năng hỗ trợ kê khai thuế trên Achat GO:</div>
                <ul className="list-disc pl-4 space-y-1 text-indigo-800">
                  <li>Tự động xuất báo cáo doanh thu theo từng kênh (Livestream, Facebook, POS).</li>
                  <li>Tách riêng doanh thu chịu thuế VAT 8% và 10% theo từng mã sản phẩm.</li>
                  <li>Đối soát tự động tiền COD và chuyển khoản ngân hàng, tránh sai sót lệch doanh thu khai thuế.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowTaxAdviceModal(false)}
                className="rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-bold text-white hover:bg-[#0077E6]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import file (Nhập file đơn hàng) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#0088FF]" />
                <h3 className="text-base font-bold text-[#0F172A]">Nhập file danh sách đơn hàng</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Tải lên file Excel (.xlsx) hoặc CSV theo định dạng chuẩn của Achat GO để thêm nhanh đơn hàng hàng loạt.
              </p>
              <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="font-bold text-[#0088FF] block">Chọn file Excel/CSV từ máy tính</span>
                <span className="text-[11px] text-slate-400">hoặc kéo thả file vào đây</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleBatchExportCSV}
                  className="text-xs text-[#0088FF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="h-3 w-3" />
                  <span>Tải file mẫu Excel (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setToastMessage('Đã nhập thành công dữ liệu từ file!');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="rounded-lg bg-[#0088FF] px-4 py-2 font-bold text-white hover:bg-[#0077E6]"
                >
                  Xác nhận tải lên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
