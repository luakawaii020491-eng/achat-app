import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Trash2,
  Truck,
  QrCode,
  CreditCard,
  Banknote,
  AlertTriangle,
  UserCheck,
  Printer,
  ChevronDown,
  Sparkles,
  Facebook,
  Check,
} from 'lucide-react';
import {
  Customer,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  ProductVariant,
  ShippingCarrier,
  ShippingCarrierId,
} from '../types';
import {
  formatVND,
  generateOrderCode,
  generateTrackingCode,
  generateRoutingSortCode,
  getVietQRUrl,
  SHIPPING_CARRIERS,
} from '../utils/formatters';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  onSaveOrder: (order: Order, printImmediately?: boolean) => void;
  activeBranch: string;
  initialData?: {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    sourcePageName?: string;
  };
  carriers?: ShippingCarrier[];
  onOpenCarrierConfig?: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  onSaveOrder,
  activeBranch,
  initialData,
  carriers = SHIPPING_CARRIERS,
  onOpenCarrierConfig,
}) => {
  if (!isOpen) return null;

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [customerWard, setCustomerWard] = useState('Phường Bến Nghé');
  const [customerDistrict, setCustomerDistrict] = useState('Quận 1');
  const [customerCity, setCustomerCity] = useState('TP. Hồ Chí Minh');
  const [sourcePageName, setSourcePageName] = useState(initialData?.sourcePageName || 'Shop Bé Đan');

  // Pre-fill if initialData changes
  useEffect(() => {
    if (initialData?.customerName) setCustomerName(initialData.customerName);
    if (initialData?.customerPhone) setCustomerPhone(initialData.customerPhone);
    if (initialData?.customerAddress) setCustomerAddress(initialData.customerAddress);
    if (initialData?.sourcePageName) setSourcePageName(initialData.sourcePageName);
  }, [initialData]);

  // Product items state
  const [productSearch, setProductSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    const firstP = products[0];
    const firstV = firstP?.variants[0];
    if (!firstP || !firstV) return [];
    return [
      {
        productId: firstP.id,
        productName: firstP.name,
        variantId: firstV.id,
        sku: firstV.sku,
        color: firstV.color,
        size: firstV.size,
        weight: firstV.weight || firstP.weight || 380,
        image: firstP.image,
        quantity: 1,
        price: firstV.price,
        discount: 0,
        total: firstV.price,
      },
    ];
  });

  // Default carrier to J&T or Best Express as requested by user!
  const [selectedCarrierId, setSelectedCarrierId] = useState<ShippingCarrierId>('jnt');
  const [pushToCarrierNow, setPushToCarrierNow] = useState(false);
  const [shippingFee, setShippingFee] = useState(22000);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPaid, setIsPaid] = useState(false);
  const [noteForShipper, setNoteForShipper] = useState('Cho xem hàng trước khi nhận, không thử');
  const [internalNote, setInternalNote] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  // Search customer handler
  const matchedCustomers = customerSearch.trim()
    ? customers.filter(
        (c) =>
          c.phone.includes(customerSearch.trim()) ||
          c.name.toLowerCase().includes(customerSearch.toLowerCase().trim())
      )
    : [];

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerAddress(c.address);
    setCustomerWard(c.ward);
    setCustomerDistrict(c.district);
    setCustomerCity(c.city);
    setCustomerSearch('');
  };

  // Add product item handler
  const handleAddProductVariant = (p: Product, v: ProductVariant) => {
    const existingIndex = orderItems.findIndex((it) => it.variantId === v.id);
    const itemWeight = v.weight || p.weight || 380;
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total =
        (updated[existingIndex].price - updated[existingIndex].discount) *
        updated[existingIndex].quantity;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: p.id,
          productName: p.name,
          variantId: v.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          weight: itemWeight,
          image: p.image,
          quantity: 1,
          price: v.price,
          discount: 0,
          total: v.price,
        },
      ]);
    }
    setProductSearch('');
  };

  const handleUpdateItemQuantity = (index: number, qty: number) => {
    if (qty <= 0) return;
    const updated = [...orderItems];
    updated[index].quantity = qty;
    updated[index].total =
      (updated[index].price - updated[index].discount) * qty;
    setOrderItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Totals
  const subtotal = orderItems.reduce((acc, it) => acc + it.total, 0);
  const totalAmount = Math.max(0, subtotal + shippingFee - orderDiscount);
  const totalWeight = orderItems.reduce((acc, it) => {
    const p = products.find((prod) => prod.id === it.productId);
    const w = it.weight || p?.weight || 380;
    return acc + w * it.quantity;
  }, 0);

  // Carrier change
  const handleCarrierChange = (cid: ShippingCarrierId) => {
    setSelectedCarrierId(cid);
    const carrier = SHIPPING_CARRIERS.find((c) => c.id === cid);
    if (carrier) setShippingFee(carrier.baseFee);
  };

  // Save handler - flexibly close order normally OR push immediately to carrier
  const handleSubmitOrder = (printImmediately = false, forcePushNow?: boolean) => {
    if (!customerPhone.trim() || !customerName.trim()) {
      alert('Vui lòng nhập tên và số điện thoại khách hàng!');
      return;
    }
    if (orderItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }

    const shouldPush = forcePushNow !== undefined ? forcePushNow : pushToCarrierNow;
    const carrier = SHIPPING_CARRIERS.find((c) => c.id === selectedCarrierId);
    const trackingCode = shouldPush ? generateTrackingCode(carrier?.code || 'VN') : '';
    const sortCode = shouldPush ? generateRoutingSortCode(selectedCarrierId) : '';

    const customerObj: Customer = selectedCustomer || {
      id: `cust-${Date.now()}`,
      name: customerName,
      phone: customerPhone,
      address: customerAddress || 'Chưa có địa chỉ',
      ward: customerWard,
      district: customerDistrict,
      city: customerCity,
      totalOrders: 1,
      completedOrders: 0,
      returnedOrders: 0,
      totalSpent: 0,
      fanpageSource: sourcePageName,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: generateOrderCode(),
      createdAt: new Date().toISOString(),
      customer: customerObj,
      items: orderItems,
      subtotal,
      shippingFee,
      discountAmount: orderDiscount,
      totalAmount,
      totalWeight,
      paymentMethod,
      isPaid,
      channel: 'facebook',
      status: shouldPush ? 'shipping' : 'confirmed',
      shippingStatus: shouldPush ? 'pushed_to_carrier' : 'not_pushed',
      packagingStatus: 'ready_to_pack',
      carrierId: selectedCarrierId,
      trackingCode,
      sortCode,
      branch: activeBranch,
      sourcePageName,
      noteForShipper,
      internalNote: internalNote || `Chốt từ Fanpage ${sourcePageName}${shouldPush ? ' - Đã đẩy ĐVVC' : ' - Chờ gom đẩy'}`,
      pushedAt: shouldPush ? new Date().toISOString() : undefined,
    };

    onSaveOrder(newOrder, printImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">
                Tạo đơn hàng & Đẩy đơn vận chuyển (Achat)
              </h2>
              {sourcePageName && (
                <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#0088FF] flex items-center gap-1">
                  <Facebook className="h-3 w-3" />
                  {sourcePageName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
              <span>Chi nhánh kho: <strong>{activeBranch}</strong></span>
              <span>·</span>
              <span>Đẩy đơn trực tiếp sang J&T Express / Best Express</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: 2-column layout */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column (7 cols): Customer & Product Selection */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Customer Section */}
            <div className="rounded-xl border border-[#E2E8F0] p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Thông tin khách hàng
                </span>
                {selectedCustomer && (
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerName('');
                      setCustomerPhone('');
                      setCustomerAddress('');
                    }}
                    className="text-[11px] text-[#0088FF] hover:underline"
                  >
                    Đổi khách hàng
                  </button>
                )}
              </div>

              {/* Customer Search Bar */}
              {!selectedCustomer && (
                <div className="relative">
                  <div className="flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs">
                    <Search className="h-3.5 w-3.5 text-[#94A3B8] mr-2" />
                    <input
                      type="text"
                      placeholder="Tìm khách hàng theo SĐT (09...) hoặc tên..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-transparent outline-none text-[#0F172A]"
                    />
                  </div>

                  {matchedCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 rounded-lg border border-[#E2E8F0] bg-white shadow-lg p-1 z-20 max-h-48 overflow-y-auto">
                      {matchedCustomers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left p-2 rounded-md hover:bg-[#F1F5F9] transition-colors text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-[#0F172A]">{c.name}</div>
                            <div className="text-[11px] text-[#64748B] font-mono">{c.phone} · {c.city}</div>
                          </div>
                          {c.isBoomWarning ? (
                            <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                              ⚠️ Bom hàng
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                              {c.completedOrders} đơn
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Customer fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#475569]">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#475569]">Số điện thoại *</label>
                  <input
                    type="text"
                    placeholder="0912345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#0F172A] outline-none font-mono focus:border-[#0088FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#475569]">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-[#64748B]">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="mt-1 w-full rounded border border-[#CBD5E1] px-2 py-1 text-xs text-[#0F172A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#64748B]">Quận / Huyện</label>
                  <input
                    type="text"
                    value={customerDistrict}
                    onChange={(e) => setCustomerDistrict(e.target.value)}
                    className="mt-1 w-full rounded border border-[#CBD5E1] px-2 py-1 text-xs text-[#0F172A] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#64748B]">Phường / Xã</label>
                  <input
                    type="text"
                    value={customerWard}
                    onChange={(e) => setCustomerWard(e.target.value)}
                    className="mt-1 w-full rounded border border-[#CBD5E1] px-2 py-1 text-xs text-[#0F172A] outline-none"
                  />
                </div>
              </div>

              {selectedCustomer?.isBoomWarning && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    <strong>Cảnh báo bom hàng:</strong> Khách này đã từng chuyển hoàn {selectedCustomer.returnedOrders} đơn!
                  </span>
                </div>
              )}
            </div>

            {/* 2. Products Picker & Line Items */}
            <div className="rounded-xl border border-[#E2E8F0] p-4 bg-white space-y-3">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Sản phẩm chốt đơn ({orderItems.length})
              </span>

              {/* Product search box */}
              <div className="relative">
                <div className="flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs">
                  <Search className="h-3.5 w-3.5 text-[#94A3B8] mr-2" />
                  <input
                    type="text"
                    placeholder="Tìm tên sản phẩm hoặc mã SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#0F172A]"
                  />
                </div>

                {productSearch.trim() && (
                  <div className="absolute left-0 right-0 mt-1 rounded-lg border border-[#E2E8F0] bg-white shadow-lg p-1.5 z-20 max-h-56 overflow-y-auto">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.variants.some((v) => v.sku.toLowerCase().includes(productSearch.toLowerCase()))
                      )
                      .map((p) => (
                        <div key={p.id} className="p-2 border-b border-[#F1F5F9] last:border-b-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <img src={p.image} alt={p.name} className="h-8 w-8 rounded object-cover" />
                            <span className="text-xs font-semibold text-[#0F172A]">{p.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-10">
                            {p.variants.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => handleAddProductVariant(p, v)}
                                className="rounded bg-[#F1F5F9] hover:bg-[#0088FF] hover:text-white px-2 py-1 text-[11px] font-mono transition-colors text-[#334155]"
                              >
                                {v.sku} ({v.color}/{v.size}) - {formatVND(v.price)} [Kho: {v.stock}]
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#F1F5F9] border-t border-[#F1F5F9]">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt={item.productName} className="h-10 w-10 rounded-md object-cover border border-[#E2E8F0]" />
                      <div>
                        <div className="font-semibold text-[#1E293B] line-clamp-1">{item.productName}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">
                          {item.sku} · {item.color} / {item.size}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity adjuster */}
                      <div className="flex items-center rounded border border-[#CBD5E1]">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-[#F1F5F9] text-[#64748B]"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold text-[#0F172A] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-[#F1F5F9] text-[#64748B]"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-mono font-bold text-[#0F172A] tabular-nums text-right w-20">
                        {formatVND(item.total)}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[#94A3B8] hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* GHI CHÚ ĐƠN HÀNG (ĐẶT NGAY PHÍA DƯỚI PHẦN CHỌN SẢN PHẨM THEO YÊU CẦU) */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📝 Ghi chú đơn hàng &amp; Dặn Shipper</span>
                  </span>
                  <span className="rounded bg-amber-200/80 text-amber-900 font-bold text-[10px] px-2 py-0.5">
                    In lên phiếu giao
                  </span>
                </div>

                <textarea
                  rows={2}
                  placeholder="Ghi chú giao hàng (Ví dụ: Cho xem hàng, gọi trước khi giao, giao giờ hành chính, hàng dễ vỡ...)"
                  value={noteForShipper}
                  onChange={(e) => setNoteForShipper(e.target.value)}
                  className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:ring-1 focus:ring-[#0088FF]"
                />

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Cho xem hàng, không thử',
                    'Giao giờ hành chính',
                    'Gọi trước khi giao',
                    'Hàng dễ vỡ xin nhẹ tay',
                    'Giao sau 17h',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNoteForShipper(tag)}
                      className="rounded-md border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-medium text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Shipping & Payment Details */}
          <div className="lg:col-span-5 space-y-5">
            {/* 3. Shipping Process & Carrier Selection */}
            <div className="rounded-xl border border-[#E2E8F0] p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#0088FF]" />
                  Quy trình xử lý đơn &amp; Vận chuyển
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-[#0088FF]">
                  Cân nặng: <strong className="font-mono">{totalWeight}g</strong>
                </span>
              </div>

              {/* Flexible Mode: Close order normally vs Push to carrier now */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPushToCarrierNow(false)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    !pushToCarrierNow
                      ? 'border-[#0088FF] bg-blue-50/70 ring-2 ring-[#0088FF]/30 shadow-2xs'
                      : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${!pushToCarrierNow ? 'bg-[#0088FF]' : 'bg-slate-300'}`} />
                    <span>Chỉ chốt đơn (Lưu gom đẩy sau)</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-snug">
                    Lưu đơn sẵn sàng đóng hàng. Khi tổng hợp đơn trong ngày mới gom đẩy theo danh mục.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPushToCarrierNow(true)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    pushToCarrierNow
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-2xs'
                      : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${pushToCarrierNow ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>Chốt &amp; Đẩy sang ĐVVC ngay</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-snug">
                    Gửi ngay sang hãng vận chuyển và cấp mã vận đơn tracking code cho bưu tá.
                  </p>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-[#475569]">
                  {pushToCarrierNow ? 'Chọn hãng vận chuyển đẩy ngay:' : 'Dự kiến hãng vận chuyển:'}
                </span>
                {onOpenCarrierConfig && (
                  <button
                    type="button"
                    onClick={onOpenCarrierConfig}
                    className="text-[10px] text-[#0088FF] font-semibold hover:underline"
                  >
                    + Cấu hình kết nối ĐVVC
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {carriers.filter((c) => c.isConnected).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCarrierChange(c.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selectedCarrierId === c.id
                        ? 'border-[#0088FF] bg-[#F0F7FF] text-[#0F172A] shadow-2xs font-semibold'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.badgeColor}`}>
                        {c.logoText}
                      </span>
                      <div className="text-left">
                        <span className="font-semibold">{c.name}</span>
                        {c.codBalance && (
                          <div className="text-[10px] text-emerald-700">Ví COD: {formatVND(c.codBalance)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#0088FF]">{formatVND(c.baseFee)}</div>
                      <div className="text-[10px] text-[#94A3B8]">{c.estimatedDays}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#475569]">Ghi chú giao hàng cho shipper</label>
                <input
                  type="text"
                  value={noteForShipper}
                  onChange={(e) => setNoteForShipper(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs text-[#0F172A] outline-none"
                />
              </div>
            </div>

            {/* 4. Payment & Totals */}
            <div className="rounded-xl border border-[#E2E8F0] p-4 bg-white space-y-3">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Thanh toán & Thu hộ COD
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold ${
                    paymentMethod === 'cod'
                      ? 'border-[#0088FF] bg-[#F0F7FF] text-[#0088FF]'
                      : 'border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Thu hộ COD</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('vietqr');
                    setShowQRModal(true);
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold ${
                    paymentMethod === 'vietqr'
                      ? 'border-[#0088FF] bg-[#F0F7FF] text-[#0088FF]'
                      : 'border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Chuyển khoản VietQR</span>
                </button>
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 border-t border-[#F1F5F9] pt-3 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Tiền hàng:</span>
                  <span className="font-mono font-medium text-[#0F172A]">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Phí ship:</span>
                  <span className="font-mono font-medium text-[#0F172A]">{formatVND(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Giảm giá / Voucher:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={orderDiscount}
                      onChange={(e) => setOrderDiscount(Number(e.target.value))}
                      className="w-20 font-mono text-right border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-rose-600"
                    />
                    <span>đ</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-bold text-[#0F172A]">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="font-mono text-[#0088FF] text-base tabular-nums">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center flex-wrap gap-2">
            {/* Action 1: Normal close - saves order, holds for batch push later */}
            <button
              type="button"
              onClick={() => handleSubmitOrder(false, false)}
              className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
              title="Lưu đơn hàng vào hệ thống, chưa đẩy sang đơn vị vận chuyển (để gom đẩy theo danh mục sau)"
            >
              <Check className="h-4 w-4 text-[#0088FF]" />
              <span>Chốt đơn (Lưu đơn thường - F1)</span>
            </button>

            {/* Action 2: Print immediately */}
            <button
              type="button"
              onClick={() => handleSubmitOrder(true, pushToCarrierNow)}
              className="flex items-center gap-1.5 rounded-lg border border-[#0088FF]/30 bg-[#EBF5FF] px-3.5 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#D8EDFF] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Lưu &amp; In phiếu</span>
            </button>

            {/* Action 3: Push immediately to carrier */}
            <button
              type="button"
              onClick={() => handleSubmitOrder(false, true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] active:bg-[#0066CC] cursor-pointer"
              title="Chốt đơn và đẩy thẳng sang đơn vị vận chuyển để lấy mã vận đơn"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Chốt &amp; Đẩy sang {selectedCarrierId.toUpperCase()} ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic VietQR Preview Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#0F172A]">Mã VietQR thanh toán tự động</span>
              <button onClick={() => setShowQRModal(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border border-[#E2E8F0] rounded-xl p-3 bg-white">
              <img
                src={getVietQRUrl(totalAmount, `THANHTOAN ${customerPhone || 'DONHANG'}`)}
                alt="VietQR Napas"
                className="w-full h-auto mx-auto rounded"
              />
            </div>
            <div className="mt-3 text-xs text-[#64748B]">
              <div className="font-semibold text-[#0F172A]">MBBank - 0988999888</div>
              <div>Chủ TK: NGUYEN VAN THANG (BINBINBOBO)</div>
              <div className="font-mono text-[#0088FF] font-bold text-sm mt-1">{formatVND(totalAmount)}</div>
            </div>
            <button
              onClick={() => {
                setIsPaid(true);
                setShowQRModal(false);
              }}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Xác nhận đã nhận chuyển khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
