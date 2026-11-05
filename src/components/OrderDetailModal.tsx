import React, { useState } from 'react';
import {
  X,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Copy,
  AlertTriangle,
  User,
  MapPin,
  Phone,
  Send,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import {
  formatVND,
  formatDate,
  getStatusBadge,
  getChannelBadge,
} from '../utils/formatters';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onPrintOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onTogglePaid: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onPrintOrder,
  onUpdateStatus,
  onTogglePaid,
}) => {
  if (!order) return null;

  const [isPushingCarrier, setIsPushingCarrier] = useState(false);
  const [carrierPushResult, setCarrierPushResult] = useState<{
    success: boolean;
    trackingCode: string;
    sortCode: string;
    lookupUrl: string;
  } | null>(null);

  const statusBadge = getStatusBadge(order.status);
  const channelBadge = getChannelBadge(order.channel);

  // Push order directly to carrier API
  const handlePushToCarrier = async (carrierTarget: string) => {
    setIsPushingCarrier(true);
    setCarrierPushResult(null);

    try {
      const res = await fetch('/api/carriers/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierId: carrierTarget,
          orderData: order,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCarrierPushResult(data);
        onUpdateStatus(order.id, 'confirmed');
      }
    } catch (err) {
      console.error('Failed to push to carrier:', err);
    } finally {
      setIsPushingCarrier(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#0F172A]">
              Chi tiết đơn hàng {order.code}
            </h2>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
            >
              {statusBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintOrder(order)}
              className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-[#64748B]" />
              <span>In phiếu giao</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Carrier Push Action Bar (JT & Best Express) */}
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-[#1E3A8A] flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-[#0088FF]" />
                Đẩy đơn trực tiếp sang đơn vị vận chuyển
              </div>
              <p className="text-[11px] text-[#3B82F6] mt-0.5">
                Bấm đẩy đơn để lấy mã vận đơn tự động và kích hoạt shipper đến kho lấy hàng.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handlePushToCarrier('jnt')}
                disabled={isPushingCarrier}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
              >
                {isPushingCarrier ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Đẩy sang J&T</span>
              </button>

              <button
                onClick={() => handlePushToCarrier('best')}
                disabled={isPushingCarrier}
                className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-600 shadow-xs"
              >
                {isPushingCarrier ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Đẩy sang Best</span>
              </button>
            </div>
          </div>

          {/* Carrier push feedback */}
          {carrierPushResult && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <strong>Đã đẩy đơn thành công!</strong> Mã vận đơn: <span className="font-mono font-bold">{carrierPushResult.trackingCode}</span> · Mã tuyến phát: <span className="font-mono font-bold">{carrierPushResult.sortCode}</span>
                </div>
              </div>
              <a
                href={carrierPushResult.lookupUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#0088FF] font-semibold hover:underline shrink-0 ml-2"
              >
                <span>Tra cứu</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Stepper */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[#475569]">
              <span>Tiến trình xử lý:</span>
              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'confirmed')}
                    className="rounded bg-[#0088FF] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0077E6]"
                  >
                    Duyệt đơn đóng gói
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'shipping')}
                    className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Giao cho Shipper
                  </button>
                )}
                {order.status === 'shipping' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'delivered')}
                    className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Xác nhận giao thành công
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2 rounded-lg ${order.status !== 'cancelled' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                1. Đặt hàng
              </div>
              <div className={`p-2 rounded-lg ${['confirmed', 'shipping', 'delivered'].includes(order.status) ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                2. Đóng gói
              </div>
              <div className={`p-2 rounded-lg ${['shipping', 'delivered'].includes(order.status) ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                3. Đang giao
              </div>
              <div className={`p-2 rounded-lg ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                4. Thành công
              </div>
            </div>
          </div>

          {/* Customer & Shipping info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E2E8F0] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 font-bold text-[#0F172A]">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#0088FF]" />
                  Thông tin người nhận
                </span>
                {order.customer.isBoomWarning && (
                  <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                    ⚠️ Từng hoàn hàng
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1E293B]">{order.customer.name}</div>
                <div className="text-[#64748B] flex items-center gap-1 mt-0.5 font-mono">
                  <Phone className="h-3 w-3" />
                  {order.customer.phone}
                </div>
              </div>
              <div className="text-[#475569] flex items-start gap-1 pt-1">
                <MapPin className="h-3 w-3 text-[#94A3B8] shrink-0 mt-0.5" />
                <span>
                  {order.customer.address}, {order.customer.ward}, {order.customer.district}, {order.customer.city}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 font-bold text-[#0F172A]">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-[#0088FF]" />
                  Đơn vị vận chuyển
                </span>
                <span className="uppercase text-[#64748B] font-mono">{order.carrierId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Mã vận đơn:</span>
                <span className="font-mono font-bold text-[#0088FF] text-sm">{order.trackingCode}</span>
              </div>
              {order.sortCode && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Mã phân loại tuyến:</span>
                  <span className="font-mono font-bold text-[#0F172A]">{order.sortCode}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Khối lượng gói hàng:</span>
                <span className="font-mono font-bold text-[#0F172A]">{order.totalWeight ? `${order.totalWeight}g` : '380g'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Kênh bán hàng:</span>
                <span className="font-semibold text-[#1E293B]">{channelBadge.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Ghi chú shipper:</span>
                <span className="text-[#1E293B] italic">{order.noteForShipper || 'Không có'}</span>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-xl border border-[#E2E8F0] p-4 text-xs">
            <h3 className="font-bold text-[#0F172A] mb-3">
              Danh sách sản phẩm trong đơn ({order.items.length})
            </h3>
            <div className="divide-y divide-[#F1F5F9]">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={it.image} alt={it.productName} className="h-10 w-10 rounded-md object-cover border border-[#E2E8F0]" />
                    <div>
                      <div className="font-semibold text-[#1E293B]">{it.productName}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">
                        Mã: {it.sku} · Size {it.size} · {it.color}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[#64748B]">
                      {formatVND(it.price)} x {it.quantity}
                    </div>
                    <div className="font-bold text-[#0F172A]">{formatVND(it.total)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E2E8F0] mt-3 pt-3 space-y-1.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Tiền hàng:</span>
                <span className="font-mono font-medium text-[#0F172A]">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-mono font-medium text-[#0F172A]">{formatVND(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Chiết khấu / Giảm giá:</span>
                  <span className="font-mono font-medium">-{formatVND(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-bold text-[#0F172A]">
                <span>Tổng tiền thu khách (COD):</span>
                <span className="font-mono text-[#0088FF] text-base">{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="text-xs text-[#64748B]">
            Ngày tạo: {formatDate(order.createdAt)} · {order.branch}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#182538] px-4 py-2 text-xs font-semibold text-white hover:bg-[#24334B]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
