import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Truck,
  Check,
  Printer,
  ChevronDown,
  Sparkles,
  Maximize2,
  AlertCircle,
  Phone,
  MapPin,
  User,
  RotateCcw,
  Tag,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  Conversation,
  Customer,
  Order,
  OrderItem,
  Product,
  ProductVariant,
  ShippingCarrier,
  ShippingCarrierId,
} from '../types';
import { formatVND } from '../utils/formatters';

interface DockedOrderCreationPanelProps {
  conversation: Conversation;
  products: Product[];
  carriers: ShippingCarrier[];
  activeBranch?: string;
  onSaveOrder: (newOrder: Order, printImmediately?: boolean) => void;
  onOpenFullscreenModal: () => void;
  initialSku?: string;
  initialQuantity?: number;
}

interface SelectedItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export const DockedOrderCreationPanel: React.FC<DockedOrderCreationPanelProps> = ({
  conversation,
  products,
  carriers,
  activeBranch = 'Kho Tổng - TP. Hồ Chí Minh',
  onSaveOrder,
  onOpenFullscreenModal,
  initialSku,
  initialQuantity = 1,
}) => {
  // Customer details (prefilled from conversation)
  const [customerName, setCustomerName] = useState(conversation.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(conversation.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(conversation.customerAddress || '');

  // Synchronize when active conversation changes
  useEffect(() => {
    setCustomerName(conversation.customerName || '');
    setCustomerPhone(conversation.customerPhone || '');
    setCustomerAddress(conversation.customerAddress || '');
  }, [conversation.id]);

  // Selected products for order
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(() => {
    if (products.length > 0 && products[0].variants.length > 0) {
      return [
        {
          id: `item-${Date.now()}`,
          product: products[0],
          variant: products[0].variants[0],
          quantity: initialQuantity,
        },
      ];
    }
    return [];
  });

  // Handle initialSku if passed
  useEffect(() => {
    if (initialSku) {
      for (const prod of products) {
        const found = prod.variants.find((v) => v.sku === initialSku);
        if (found) {
          setSelectedItems([
            {
              id: `item-${Date.now()}`,
              product: prod,
              variant: found,
              quantity: initialQuantity,
            },
          ]);
          break;
        }
      }
    }
  }, [initialSku, initialQuantity]);

  const [selectedCarrierId, setSelectedCarrierId] = useState<ShippingCarrierId>(
    carriers.find((c) => c.isConnected)?.id || 'jnt'
  );
  const selectedCarrier = carriers.find((c) => c.id === selectedCarrierId) || carriers[0];
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [noteForShipper, setNoteForShipper] = useState<string>('Cho xem hàng, không cho thử');
  const [pushToCarrierNow, setPushToCarrierNow] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [promptPushOrder, setPromptPushOrder] = useState<Order | null>(null);

  // Search product dropdown
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Financial calculations
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  const totalWeight = selectedItems.reduce(
    (sum, item) => sum + (item.variant.weight || item.product.weight || 350) * item.quantity,
    0
  );
  const totalAmount = Math.max(0, subtotal + shippingFee - orderDiscount);

  // Quick Add Item
  const handleAddItem = (prod: Product, variant: ProductVariant) => {
    const existingIndex = selectedItems.findIndex((it) => it.variant.id === variant.id);
    if (existingIndex >= 0) {
      setSelectedItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          product: prod,
          variant,
          quantity: 1,
        },
      ]);
    }
    setShowProductDropdown(false);
    setProductSearch('');
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as SelectedItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Submit Order directly from Right Window
  const handleSaveOrderDirectly = (printImmediately = false, forcePushNow = false) => {
    if (!customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    const shouldPush = forcePushNow || pushToCarrierNow;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `SON${randomSuffix}`;
    const trackingCode = shouldPush ? `VN${randomSuffix}JNT` : `CHUA_DAY_${randomSuffix}`;

    const orderItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      variantId: item.variant.id,
      sku: item.variant.sku,
      color: item.variant.color,
      size: item.variant.size,
      quantity: item.quantity,
      price: item.variant.price,
      total: item.variant.price * item.quantity,
      weight: item.variant.weight || item.product.weight || 350,
      image: item.product.image || '',
      discount: 0,
    }));

    const customerObj: Customer = {
      id: `cust-${Date.now()}`,
      name: customerName.trim(),
      phone: customerPhone.trim() || '0988000111',
      address: customerAddress.trim() || 'Đang cập nhật địa chỉ',
      ward: '',
      district: '',
      city: '',
      totalOrders: 1,
      completedOrders: 0,
      returnedOrders: 0,
      totalSpent: totalAmount,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: orderCode,
      createdAt: new Date().toISOString(),
      customer: customerObj,
      items: orderItems,
      subtotal,
      shippingFee,
      discountAmount: orderDiscount,
      totalAmount,
      totalWeight,
      paymentMethod: isPaid ? 'vietqr' : 'cod',
      isPaid,
      channel: 'facebook',
      status: shouldPush ? 'shipping' : 'confirmed',
      shippingStatus: shouldPush ? 'pushed_to_carrier' : 'not_pushed',
      packagingStatus: 'ready_to_pack',
      carrierId: selectedCarrierId,
      trackingCode,
      sortCode: 'HAN-CG-01',
      branch: activeBranch,
      sourcePageName: conversation.pageName,
      noteForShipper,
      internalNote: `Chốt đơn từ Achat trực tiếp bên phải chat - Fanpage ${conversation.pageName}${shouldPush ? ' (Đã đẩy ĐVVC)' : ' (Lưu gom đẩy sau)'}`,
      pushedAt: shouldPush ? new Date().toISOString() : undefined,
    };

    onSaveOrder(newOrder, printImmediately);
    if (!shouldPush) {
      setPromptPushOrder(newOrder);
    } else {
      setSuccessToast(`Đã chốt & đẩy đơn sang ${selectedCarrier?.name || 'ĐVVC'}! Mã: ${newOrder.code}`);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(q))
    );
  });

  return (
    <div className="relative flex flex-col h-full bg-white select-none text-xs">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3 bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0088FF] text-white shadow-2xs">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-[#0F172A] leading-tight">
              Cửa sổ lên đơn &amp; Chốt đơn
            </h3>
            <span className="text-[10px] text-[#64748B] truncate max-w-[160px] block">
              {conversation.pageName || 'Fanpage bán hàng'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenFullscreenModal}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0088FF] hover:bg-blue-50 transition-colors cursor-pointer"
            title="Mở rộng toàn màn hình"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="bg-emerald-500 text-white px-4 py-2 font-bold text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-white hover:opacity-80"
          >
            ×
          </button>
        </div>
      )}

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* 1. Thông tin khách hàng */}
        <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-[#0088FF]" />
              <span>Người nhận hàng</span>
            </span>
            {conversation.customerPhone && (
              <span className="rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-1.5 py-0.2">
                Đã nhận diện SĐT
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Tên khách hàng *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] font-semibold"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Số điện thoại *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#0F172A] outline-none focus:border-[#0088FF]"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Địa chỉ giao hàng (Số nhà, đường, phường, quận, tỉnh) *"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
            />
          </div>
        </div>

        {/* 2. Giỏ hàng & Chọn sản phẩm */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-[#0088FF]" />
              <span>Sản phẩm chọn ({selectedItems.length})</span>
            </span>

            {/* Quick Add Bestsellers */}
            <div className="flex items-center gap-1">
              {products.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddItem(p, p.variants[0])}
                  className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-[#0088FF] hover:bg-blue-100 cursor-pointer truncate max-w-[100px]"
                  title={p.name}
                >
                  + {p.name.slice(0, 12)}...
                </button>
              ))}
            </div>
          </div>

          {/* Search/Add Product Dropdown */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Tìm sản phẩm theo tên, mã SKU..."
              value={productSearch}
              onFocus={() => setShowProductDropdown(true)}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
            />

            {showProductDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-[#CBD5E1] bg-white shadow-xl z-30 p-1 divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="p-1.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-8 w-8 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-[#0F172A] truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-[#0088FF] font-bold">
                          {formatVND(p.basePrice)}
                        </div>
                      </div>
                    </div>
                    {/* Variant chips */}
                    <div className="flex flex-wrap gap-1 pl-10">
                      {p.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleAddItem(p, v)}
                          className="rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-700 transition-colors cursor-pointer"
                        >
                          {v.color || ''} {v.size ? `Sz:${v.size}` : ''} ({v.stock})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setShowProductDropdown(false)}
                  className="w-full text-center py-1 text-[11px] text-[#64748B] hover:text-[#0F172A] font-medium"
                >
                  Đóng tìm kiếm
                </button>
              </div>
            )}
          </div>

          {/* Selected Items List */}
          <div className="space-y-1.5">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-2 bg-[#F8FAFC] gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-9 w-9 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-[#0F172A] truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-[#64748B] flex items-center gap-2 font-mono">
                      <span>{item.variant.sku}</span>
                      <span>{item.variant.color} {item.variant.size ? `· Sz ${item.variant.size}` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs text-[#0088FF]">
                    {formatVND(item.variant.price * item.quantity)}
                  </span>

                  <div className="flex items-center border border-[#CBD5E1] rounded-lg bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="px-2 py-0.5 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="px-2 py-0.5 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GHI CHÚ ĐƠN HÀNG (ĐẶT NGAY PHÍA DƯỚI PHẦN CHỌN SẢN PHẨM THEO YÊU CẦU) */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-amber-600" />
              <span>Ghi chú đơn hàng &amp; Dặn Shipper</span>
            </span>
            <span className="rounded bg-amber-200/80 text-amber-900 font-bold text-[10px] px-1.5 py-0.5">
              In lên phiếu
            </span>
          </div>

          <textarea
            rows={2}
            placeholder="Ghi chú đơn hàng (Cho xem hàng, giao giờ hành chính, gọi trước khi giao, hàng dễ vỡ...)"
            value={noteForShipper}
            onChange={(e) => setNoteForShipper(e.target.value)}
            className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:ring-1 focus:ring-[#0088FF]"
          />

          <div className="flex flex-wrap gap-1">
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

        {/* 3. Vận chuyển & Mode Đẩy đơn */}
        <div className="rounded-xl border border-[#CBD5E1] p-3 space-y-2.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-[#0088FF]" />
              <span>Đối tác vận chuyển</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Khối lượng: {totalWeight}g
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {carriers.slice(0, 6).map((c) => {
              const isSelected = selectedCarrierId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCarrierId(c.id)}
                  className={`rounded-lg border p-1.5 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0088FF] bg-blue-50 text-[#0088FF] font-bold shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-[11px] truncate">{c.name.split(' ')[0]}</div>
                  <div className="text-[9px] text-slate-500">{c.code}</div>
                </button>
              );
            })}
          </div>

          {/* Mode Switcher: Chốt đơn thường vs Đẩy ĐVVC ngay (user's explicit requirement!) */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-2 space-y-1.5">
            <div className="font-bold text-[11px] text-indigo-950">
              Chế độ chốt đơn:
            </div>
            <div className="flex flex-col gap-1 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="pushMode"
                  checked={!pushToCarrierNow}
                  onChange={() => setPushToCarrierNow(false)}
                  className="accent-[#0088FF]"
                />
                <span>Chỉ chốt đơn (Lưu gom trong ngày, đẩy ĐVVC sau)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="pushMode"
                  checked={pushToCarrierNow}
                  onChange={() => setPushToCarrierNow(true)}
                  className="accent-[#0088FF]"
                />
                <span className="font-bold text-[#0088FF]">Chốt &amp; Đẩy sang ĐVVC lấy mã vận đơn ngay</span>
              </label>
            </div>
          </div>

          {/* Fees & Discount Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600">Phí vận chuyển (đ)</label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="mt-0.5 w-full rounded-lg border border-[#CBD5E1] px-2 py-1 font-mono font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600">Giảm giá / Voucher (đ)</label>
              <input
                type="number"
                value={orderDiscount}
                onChange={(e) => setOrderDiscount(Number(e.target.value))}
                className="mt-0.5 w-full rounded-lg border border-[#CBD5E1] px-2 py-1 font-mono font-semibold outline-none text-rose-600"
              />
            </div>
          </div>

          {/* Paid status toggle */}
          <label className="flex items-center gap-2 pt-1 border-t border-slate-100 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="accent-[#0088FF] h-4 w-4"
            />
            <span className="font-semibold text-slate-700">Khách đã chuyển khoản trước (Thu hộ COD: 0 đ)</span>
          </label>
        </div>

        {/* 4. Tổng kết tài chính COD */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
          <div className="flex justify-between text-[#64748B]">
            <span>Tiền hàng:</span>
            <span className="font-semibold text-slate-800">{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Phí ship:</span>
            <span className="font-semibold text-slate-800">+{formatVND(shippingFee)}</span>
          </div>
          {orderDiscount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Giảm giá:</span>
              <span className="font-semibold">-{formatVND(orderDiscount)}</span>
            </div>
          )}
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
            <span className="font-extrabold text-xs text-[#0F172A] uppercase">
              {isPaid ? 'Tổng giá trị đơn:' : 'Tiền thu COD:'}
            </span>
            <span className="font-black text-base text-[#0088FF]">
              {isPaid ? formatVND(totalAmount) : formatVND(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="border-t border-[#E2E8F0] p-3 bg-white space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Primary Button 1: Chốt đơn lưu thường */}
          <button
            type="button"
            onClick={() => handleSaveOrderDirectly(false, false)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0088FF] hover:bg-[#0077E6] py-2.5 px-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Chốt đơn (Lưu F1)</span>
          </button>

          {/* Primary Button 2: Chốt & Đẩy ĐVVC ngay */}
          <button
            type="button"
            onClick={() => handleSaveOrderDirectly(false, true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 px-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            <Truck className="h-4 w-4" />
            <span>Chốt &amp; Đẩy ĐVVC</span>
          </button>
        </div>

        {/* Secondary: Lưu & In phiếu */}
        <button
          type="button"
          onClick={() => handleSaveOrderDirectly(true, false)}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 py-1.5 text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5 text-[#0088FF]" />
          <span>Lưu &amp; In phiếu giao hàng (PDF)</span>
        </button>
      </div>

      {/* Confirmation Dialog: Ask whether to push to carrier now or bulk push later in Quản lý đơn hàng */}
      {promptPushOrder && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-full max-w-xs space-y-3.5 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-slate-900">Đã chốt đơn thành công!</h4>
                <p className="text-[10px] text-slate-500 font-mono">
                  Mã đơn: <span className="font-bold text-[#0088FF]">{promptPushOrder.code}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Khách hàng:</span>
                <span className="font-bold text-slate-900 truncate max-w-[130px]">{promptPushOrder.customer.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thu COD:</span>
                <span className="font-black text-[#0088FF]">{formatVND(promptPushOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ĐVVC:</span>
                <span className="font-bold text-emerald-700">{selectedCarrier?.name || 'J&T Express'}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
              <strong>Bạn có muốn đẩy đơn sang ĐVVC ngay không?</strong>
              <p className="text-slate-600 text-[10px] mt-0.5">
                Hoặc chọn &quot;Để sau&quot; để gom và đẩy đơn hàng loạt tại mục Quản lý đơn hàng.
              </p>
            </div>

            <div className="space-y-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  const pushedOrder: Order = {
                    ...promptPushOrder,
                    status: 'shipping',
                    shippingStatus: 'pushed_to_carrier',
                    trackingCode: `VN${Math.floor(100000 + Math.random() * 900000)}${selectedCarrier?.code || 'JNT'}`,
                    pushedAt: new Date().toISOString(),
                  };
                  onSaveOrder(pushedOrder, false);
                  setPromptPushOrder(null);
                  setSuccessToast(`Đã đẩy đơn sang ${selectedCarrier?.name || 'ĐVVC'}! Mã vận đơn: ${pushedOrder.trackingCode}`);
                  setTimeout(() => setSuccessToast(null), 3500);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
              >
                <Truck className="h-4 w-4" />
                <span>Đẩy ngay sang {selectedCarrier?.code || 'ĐVVC'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPromptPushOrder(null);
                  setSuccessToast(`Đã lưu đơn! Bạn có thể tổng hợp và đẩy hàng loạt tại Quản lý đơn hàng.`);
                  setTimeout(() => setSuccessToast(null), 3500);
                }}
                className="w-full flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-2 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                <span>Để sau (Tổng hợp đẩy ở Quản lý đơn)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
