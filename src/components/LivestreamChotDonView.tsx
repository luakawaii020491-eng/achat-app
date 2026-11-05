import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sparkles,
  ShoppingBag,
  Printer,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Play,
  Pause,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { LiveComment, Product, Customer, Order } from '../types';
import { formatVND, generateOrderCode, generateTrackingCode } from '../utils/formatters';

interface LivestreamChotDonViewProps {
  products: Product[];
  customers: Customer[];
  onOrderCreated: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  orders: Order[];
}

export const LivestreamChotDonView: React.FC<LivestreamChotDonViewProps> = ({
  products,
  customers,
  onOrderCreated,
  onPrintOrder,
  orders,
}) => {
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [viewersCount, setViewersCount] = useState(1480);
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 'cm-1',
      authorName: 'Thu Thảo Hoàng',
      avatarColor: 'bg-emerald-500',
      avatarInitials: 'TT',
      content: 'SM01 0988123456 Size M be sữa nha shop',
      timestamp: 'Vừa xong',
      extractedPhone: '0988123456',
      matchedSku: 'SM01-BE-M',
      matchedSize: 'M',
      matchedColor: 'Be sữa',
      isValidSyntax: true,
      isClosed: false,
      customerRisk: 'loyal',
    },
    {
      id: 'cm-2',
      authorName: 'Bảo Trâm Nguyễn',
      avatarColor: 'bg-purple-500',
      avatarInitials: 'BT',
      content: 'Chị ơi đầm hoa nhí cao 1m58 48kg mặc size gì đẹp ạ?',
      timestamp: '30 giây trước',
      isValidSyntax: false,
      isClosed: false,
      customerRisk: 'normal',
    },
    {
      id: 'cm-3',
      authorName: 'Đức Long Fashion',
      avatarColor: 'bg-blue-500',
      avatarInitials: 'ĐL',
      content: 'AT02 0912345678 size L đen chốt nhanh cho anh nhé',
      timestamp: '1 phút trước',
      extractedPhone: '0912345678',
      matchedSku: 'AT02-DEN-L',
      matchedSize: 'L',
      matchedColor: 'Đen Washed',
      isValidSyntax: true,
      isClosed: false,
      customerRisk: 'normal',
    },
    {
      id: 'cm-4',
      authorName: 'Yến Nhi',
      avatarColor: 'bg-rose-500',
      avatarInitials: 'YN',
      content: 'DAM03 0977889911 S hoa kem',
      timestamp: '2 phút trước',
      extractedPhone: '0977889911',
      matchedSku: 'DAM03-HOA-S',
      matchedSize: 'S',
      matchedColor: 'Hoa nhí kem',
      isValidSyntax: true,
      isClosed: false,
      customerRisk: 'warning_boom',
    },
  ]);

  const [activePinnedProduct, setActivePinnedProduct] = useState<Product>(products[0]);
  const [liveDiscount, setLiveDiscount] = useState<number>(20000); // 20k voucher on live
  const [customCommentInput, setCustomCommentInput] = useState('');
  const [authorInput, setAuthorInput] = useState('Khách xem live');
  const [filterSyntaxOnly, setFilterSyntaxOnly] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Live viewers jitter simulation
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      setViewersCount((prev) => prev + Math.floor(Math.random() * 9) - 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Syntax Parser Function
  const parseCommentSyntax = (text: string) => {
    // Look for Vietnamese phone number (09xx, 08xx, 07xx, 03xx, 10 digits)
    const phoneMatch = text.match(/(0[3|5|7|8|9][0-9]{8})/);
    const extractedPhone = phoneMatch ? phoneMatch[0] : undefined;

    // Check product SKUs or abbreviations (SM01, AT02, DAM03, SN04)
    let matchedSku: string | undefined;
    let matchedSize: string | undefined;
    let matchedColor: string | undefined;

    const upper = text.toUpperCase();
    if (upper.includes('SM01') || upper.includes('SM') || upper.includes('SƠ MI')) {
      matchedSku = 'SM01-BE-M';
      matchedSize = upper.includes(' L') ? 'L' : upper.includes(' S') ? 'S' : 'M';
      matchedColor = upper.includes('TRẮNG') ? 'Trắng tinh' : 'Be sữa';
    } else if (upper.includes('AT02') || upper.includes('AT') || upper.includes('THUN') || upper.includes('PHÔNG')) {
      matchedSku = 'AT02-DEN-L';
      matchedSize = upper.includes(' XL') ? 'XL' : upper.includes(' M') ? 'M' : 'L';
      matchedColor = 'Đen Washed';
    } else if (upper.includes('DAM03') || upper.includes('DAM') || upper.includes('ĐẦM') || upper.includes('VÁY')) {
      matchedSku = 'DAM03-HOA-M';
      matchedSize = upper.includes(' S') ? 'S' : upper.includes(' L') ? 'L' : 'M';
      matchedColor = 'Hoa nhí kem';
    } else if (upper.includes('SN04') || upper.includes('GIÀY') || upper.includes('SNEAKER')) {
      matchedSku = 'SN04-TRG-40';
      matchedSize = upper.includes('39') ? '39' : upper.includes('41') ? '41' : '40';
      matchedColor = 'Trắng ngà';
    }

    const isValidSyntax = Boolean(extractedPhone && matchedSku);

    // Check if phone matches any known customer with boom warning
    let customerRisk: 'normal' | 'loyal' | 'warning_boom' = 'normal';
    if (extractedPhone) {
      const existing = customers.find((c) => c.phone === extractedPhone);
      if (existing) {
        if (existing.isBoomWarning || existing.returnedOrders > 1) {
          customerRisk = 'warning_boom';
        } else if (existing.completedOrders >= 3) {
          customerRisk = 'loyal';
        }
      }
    }

    return {
      extractedPhone,
      matchedSku,
      matchedSize,
      matchedColor,
      isValidSyntax,
      customerRisk,
    };
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCommentInput.trim()) return;

    const parsed = parseCommentSyntax(customCommentInput);
    const colors = ['bg-rose-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = authorInput
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'KH';

    const newComment: LiveComment = {
      id: `cm-${Date.now()}`,
      authorName: authorInput || 'Khách xem live',
      avatarColor: chosenColor,
      avatarInitials: initials,
      content: customCommentInput,
      timestamp: 'Vừa xong',
      ...parsed,
      isClosed: false,
    };

    setComments((prev) => [newComment, ...prev]);
    setCustomCommentInput('');
  };

  // Instant order closing from comment
  const handleQuickCloseOrder = (comment: LiveComment) => {
    if (!comment.extractedPhone) return;

    // Look for customer or create temp customer
    let customer = customers.find((c) => c.phone === comment.extractedPhone);
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        name: comment.authorName,
        phone: comment.extractedPhone,
        address: 'Đang liên hệ lấy địa chỉ qua tin nhắn chốt đơn',
        ward: 'Phường Bến Nghé',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
        totalOrders: 1,
        completedOrders: 0,
        returnedOrders: 0,
        totalSpent: 0,
      };
    }

    // Match product & variant
    let product = products[0];
    let variant = product.variants[0];

    if (comment.matchedSku) {
      for (const p of products) {
        const found = p.variants.find((v) => v.sku === comment.matchedSku);
        if (found) {
          product = p;
          variant = found;
          break;
        }
      }
    }

    const price = variant.price;
    const discount = liveDiscount;
    const itemTotal = price - discount;
    const shippingFee = 25000;
    const totalAmount = itemTotal + shippingFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: generateOrderCode(),
      createdAt: new Date().toISOString(),
      customer,
      items: [
        {
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          sku: variant.sku,
          color: comment.matchedColor || variant.color,
          size: comment.matchedSize || variant.size,
          weight: variant.weight || product.weight || 380,
          image: product.image,
          quantity: 1,
          price,
          discount,
          total: itemTotal,
        },
      ],
      subtotal: price,
      shippingFee,
      discountAmount: discount,
      totalAmount,
      totalWeight: variant.weight || product.weight || 380,
      paymentMethod: 'cod',
      isPaid: false,
      channel: 'livestream',
      status: 'pending',
      carrierId: 'jnt',
      trackingCode: generateTrackingCode('JT'),
      branch: 'Kho Tổng - TP. Hồ Chí Minh',
      noteForShipper: 'Đơn chốt livestream Facebook - Cho xem hàng',
      internalNote: `Chốt tự động từ bình luận của ${comment.authorName} (${comment.content})`,
    };

    onOrderCreated(newOrder);

    // Mark comment as closed
    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, isClosed: true } : c))
    );

    setFeedbackMsg(`Đã chốt thành công đơn ${newOrder.code} cho ${comment.authorName}!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredComments = filterSyntaxOnly
    ? comments.filter((c) => c.isValidSyntax)
    : comments;

  const liveOrders = orders.filter((o) => o.channel === 'livestream');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Livestream Header Bar */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Trực tiếp
                </span>
                <h1 className="text-base font-bold text-[#0F172A]">
                  Xả kho thời trang mùa hè 2026 - Fanpage binbinbobo999
                </h1>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
                <span>Mắt xem: <strong className="font-mono text-[#0F172A]">{viewersCount.toLocaleString('vi-VN')}</strong></span>
                <span>·</span>
                <span>Thời gian phát: <strong className="font-mono text-[#0F172A]">01:42:18</strong></span>
                <span>·</span>
                <span>Đã chốt: <strong className="font-mono text-emerald-600 font-bold">{liveOrders.length} đơn</strong></span>
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs">
              <span className="text-[#64748B]">Giảm giá trên live:</span>
              <input
                type="number"
                value={liveDiscount}
                onChange={(e) => setLiveDiscount(Number(e.target.value))}
                className="w-20 font-mono font-bold text-[#0088FF] bg-transparent outline-none text-right"
              />
              <span className="text-[#64748B]">đ</span>
            </div>

            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isLiveActive
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isLiveActive ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Tiếp tục live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pinned Product Banner on Live */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3">
          <div className="flex items-center gap-3">
            <img
              src={activePinnedProduct.image}
              alt={activePinnedProduct.name}
              className="h-12 w-12 rounded-md object-cover border border-[#93C5FD] shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#0088FF] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  ĐANG GHIM TRÊN LIVE
                </span>
                <h4 className="text-xs font-bold text-[#1E293B]">
                  {activePinnedProduct.name}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-rose-600 font-bold font-mono text-sm">
                  {formatVND(activePinnedProduct.basePrice - liveDiscount)}
                </span>
                <span className="text-[11px] text-[#64748B] line-through font-mono">
                  {formatVND(activePinnedProduct.basePrice)}
                </span>
                <span className="text-[#64748B] text-[11px]">
                  (Cú pháp chốt: <strong>Mã SP + SĐT + Size</strong>)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Đổi ghim:</span>
            <select
              value={activePinnedProduct.id}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) setActivePinnedProduct(found);
              }}
              className="rounded-md border border-[#93C5FD] bg-white px-2.5 py-1 text-xs font-medium text-[#1E293B] outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Split: Left = Live Comments & Auto Syntax, Right = Closed Orders Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Live Comments Feed */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#E2E8F0] bg-white shadow-2xs overflow-hidden">
          {/* Feed Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4 bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#0088FF]" />
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Bình luận trực tiếp ({comments.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterSyntaxOnly(!filterSyntaxOnly)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filterSyntaxOnly
                    ? 'bg-[#0088FF] text-white'
                    : 'border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                <Filter className="h-3 w-3" />
                <span>Chỉ hiện có cú pháp</span>
              </button>
            </div>
          </div>

          {/* Comment List */}
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto divide-y divide-[#F1F5F9]">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="pt-3 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    {/* User Avatar */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0 ${comment.avatarColor}`}
                    >
                      {comment.avatarInitials}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#0F172A]">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {comment.timestamp}
                        </span>

                        {/* Customer Risk or Loyalty Badge */}
                        {comment.customerRisk === 'warning_boom' && (
                          <span className="flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-1.5 py-0.2 text-[10px] font-semibold text-rose-700">
                            <ShieldAlert className="h-3 w-3" />
                            Cảnh báo bom hàng (Từng hoàn 2 đơn)
                          </span>
                        )}

                        {comment.customerRisk === 'loyal' && (
                          <span className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700">
                            <UserCheck className="h-3 w-3" />
                            Khách quen (6 đơn thành công)
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-[#334155] mt-1 font-medium bg-[#F8FAFC] p-2 rounded-md border border-[#F1F5F9]">
                        {comment.content}
                      </p>

                      {/* Syntax Parsed Pills */}
                      {comment.isValidSyntax && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-700 font-mono font-medium">
                            SĐT: {comment.extractedPhone}
                          </span>
                          <span className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-purple-700 font-mono font-medium">
                            Mã: {comment.matchedSku}
                          </span>
                          {comment.matchedSize && (
                            <span className="rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-700 font-mono font-medium">
                              Size: {comment.matchedSize}
                            </span>
                          )}
                          {comment.matchedColor && (
                            <span className="rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-gray-700 font-medium">
                              Màu: {comment.matchedColor}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {comment.isClosed ? (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đã chốt đơn
                      </span>
                    ) : comment.isValidSyntax ? (
                      <button
                        onClick={() => handleQuickCloseOrder(comment)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] active:bg-[#0066CC] transition-colors whitespace-nowrap"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Chốt đơn ngay</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCustomCommentInput(`${comment.content} 09`);
                        }}
                        className="rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] font-medium text-[#64748B] hover:bg-[#F1F5F9]"
                      >
                        Hỏi SĐT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Test Comment Input Simulator */}
          <div className="border-t border-[#E2E8F0] p-3 bg-[#F8FAFC]">
            <div className="text-[11px] text-[#64748B] mb-1.5 flex items-center justify-between">
              <span>Thử nghiệm cú pháp bắt đơn trực tiếp:</span>
              <span className="font-mono text-[10px] text-[#0088FF]">
                Ví dụ: SM01 0988123456 M Be sữa
              </span>
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Tên khách"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
              />
              <input
                type="text"
                placeholder="Nội dung bình luận chốt đơn (Mã SP + SĐT + Size/Màu)..."
                value={customCommentInput}
                onChange={(e) => setCustomCommentInput(e.target.value)}
                className="flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-[#182538] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#24334B] transition-colors shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 Cols: Closed Live Orders Stream */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-[#E2E8F0] bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4 bg-[#F8FAFC]">
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Đơn chốt từ Livestream ({liveOrders.length})
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Tự động gán kho và tính phí ship GHN
              </span>
            </div>

            {liveOrders.length > 0 && (
              <button
                onClick={() => onPrintOrder(liveOrders[0])}
                className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
                title="In phiếu đóng gói"
              >
                <Printer className="h-3.5 w-3.5 text-[#64748B]" />
                <span>In bill K80</span>
              </button>
            )}
          </div>

          <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto divide-y divide-[#F1F5F9]">
            {liveOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                <ShoppingBag className="h-8 w-8 mx-auto text-[#CBD5E1] mb-2" />
                <p>Chưa có đơn hàng nào được chốt trong phiên live này.</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Bấm "Chốt đơn ngay" ở cột bên trái để chốt tự động.
                </p>
              </div>
            ) : (
              liveOrders.map((ord) => (
                <div key={ord.id} className="pt-3 first:pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0088FF]">
                          {ord.code}
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {ord.customer.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                        {ord.customer.phone} · {ord.customer.city}
                      </div>
                      <div className="text-[11px] text-[#334155] mt-1">
                        {ord.items.map((it) => (
                          <span key={it.variantId}>
                            {it.productName} ({it.size}/{it.color}) x{it.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-[#0F172A] tabular-nums">
                        {formatVND(ord.totalAmount)}
                      </div>
                      <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block mt-1">
                        Chờ đóng gói
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-[#F8FAFC] pt-2 text-[11px]">
                    <span className="text-[#64748B] font-mono">
                      Vận đơn: {ord.trackingCode} (GHN)
                    </span>
                    <button
                      onClick={() => onPrintOrder(ord)}
                      className="flex items-center gap-1 text-[#0088FF] font-semibold hover:underline"
                    >
                      <Printer className="h-3 w-3" />
                      <span>In phiếu</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
