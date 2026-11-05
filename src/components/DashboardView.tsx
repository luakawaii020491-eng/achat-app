import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertCircle,
  ArrowUpRight,
  Radio,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Order, Product, OrderStatus } from '../types';
import { formatVND, formatDate, getStatusBadge, getChannelBadge } from '../utils/formatters';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  onSelectOrderStatus: (status: OrderStatus) => void;
  onNavigateToTab: (tab: 'livestream' | 'orders' | 'products' | 'customers') => void;
  onOpenCreateOrder: () => void;
  onViewOrder: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  onSelectOrderStatus,
  onNavigateToTab,
  onOpenCreateOrder,
  onViewOrder,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | '7days' | 'month'>('today');

  // Compute metrics
  const totalOrdersCount = orders.length;
  const netRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const shippingCount = orders.filter((o) => o.status === 'shipping').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const returnedCount = orders.filter((o) => o.status === 'returned').length;

  const aov = totalOrdersCount > 0 ? Math.round(netRevenue / Math.max(1, totalOrdersCount - returnedCount)) : 0;
  const returnRate = totalOrdersCount > 0 ? ((returnedCount / totalOrdersCount) * 100).toFixed(1) : '0';

  // Revenue chart data (hourly or daily simulation)
  const chartPoints = [
    { label: '08:00', revenue: 1250000, orders: 3 },
    { label: '10:00', revenue: 2800000, orders: 6 },
    { label: '12:00', revenue: 4100000, orders: 9 },
    { label: '14:00', revenue: 3200000, orders: 7 },
    { label: '16:00', revenue: 5400000, orders: 11 },
    { label: '18:00', revenue: 4800000, orders: 10 },
    { label: '20:00 (Live)', revenue: 8650000, orders: 18 },
    { label: '22:00', revenue: 3900000, orders: 8 },
  ];

  const maxChartRev = Math.max(...chartPoints.map((p) => p.revenue));

  // Channel share
  const channelData = [
    { label: 'Facebook Live', percentage: 48, revenue: 16400000, color: 'bg-[#0088FF]' },
    { label: 'TikTok Shop', percentage: 26, revenue: 8900000, color: 'bg-[#0F172A]' },
    { label: 'Shopee', percentage: 16, revenue: 5500000, color: 'bg-orange-500' },
    { label: 'Tại quầy (POS)', percentage: 10, revenue: 3400000, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Store status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">
              Tổng quan kinh doanh
            </h1>
            <span className="text-xs text-[#64748B]">· binbinbobo999</span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dữ liệu bán hàng trực tiếp đa kênh và trạng thái chốt đơn vận chuyển.
          </p>
        </div>

        {/* Time filters & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1 shadow-2xs">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'yesterday', label: 'Hôm qua' },
              { id: '7days', label: '7 ngày qua' },
              { id: 'month', label: 'Tháng này' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  timeRange === t.id
                    ? 'bg-[#0088FF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateOrder}
            className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0077E6] transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tạo đơn</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Doanh thu */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Doanh thu thuần</span>
            <span className="flex items-center text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +24.8%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#0F172A] tabular-nums">
            {formatVND(netRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-2">
            <span>Tiền thu hộ COD:</span>
            <span className="font-mono font-medium text-[#1E293B]">
              {formatVND(netRevenue * 0.72)}
            </span>
          </div>
        </div>

        {/* KPI 2: Số đơn hàng */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Số đơn hàng</span>
            <span className="flex items-center text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +15.2%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#0F172A] tabular-nums">
            {totalOrdersCount} <span className="text-sm font-normal text-[#64748B]">đơn</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-2">
            <span>Đã giao thành công:</span>
            <span className="font-mono font-medium text-emerald-600">
              {deliveredCount} đơn
            </span>
          </div>
        </div>

        {/* KPI 3: Giá trị trung bình đơn (AOV) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Giá trị trung bình đơn</span>
            <span className="text-[11px] text-[#64748B]">AOV</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#0F172A] tabular-nums">
            {formatVND(aov)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-2">
            <span>TB sản phẩm/đơn:</span>
            <span className="font-mono font-medium text-[#1E293B]">1.8 sp</span>
          </div>
        </div>

        {/* KPI 4: Tỷ lệ hoàn / boom */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Tỷ lệ hoàn / hủy</span>
            <span className="text-[11px] text-amber-600 font-medium">Kiểm soát tốt</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#0F172A] tabular-nums">
            {returnRate}%
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-2">
            <span>Đơn chuyển hoàn:</span>
            <span className="font-mono font-medium text-rose-600">
              {returnedCount} đơn
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Pipeline Strip (Achat style) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#0F172A]">
            Trạng thái xử lý đơn hàng
          </h2>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="flex items-center gap-1 text-xs font-semibold text-[#0088FF] hover:underline"
          >
            <span>Xem danh sách đơn</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* 1. Pending */}
          <button
            onClick={() => onSelectOrderStatus('pending')}
            className="flex flex-col rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-left hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-semibold">Chờ xác nhận</span>
              <Clock className="h-4 w-4" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-amber-900 tabular-nums">
              {pendingCount}
            </div>
            <span className="text-[10px] text-amber-700 mt-0.5">Cần duyệt & gán ship</span>
          </button>

          {/* 2. Confirmed */}
          <button
            onClick={() => onSelectOrderStatus('confirmed')}
            className="flex flex-col rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-left hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-xs font-semibold">Chờ đóng gói</span>
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-blue-900 tabular-nums">
              {confirmedCount}
            </div>
            <span className="text-[10px] text-blue-700 mt-0.5">In bill & dán tem</span>
          </button>

          {/* 3. Shipping */}
          <button
            onClick={() => onSelectOrderStatus('shipping')}
            className="flex flex-col rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-left hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center justify-between text-indigo-800">
              <span className="text-xs font-semibold">Đang giao hàng</span>
              <Truck className="h-4 w-4" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-indigo-900 tabular-nums">
              {shippingCount}
            </div>
            <span className="text-[10px] text-indigo-700 mt-0.5">Shipper đang giao</span>
          </button>

          {/* 4. Delivered */}
          <button
            onClick={() => onSelectOrderStatus('delivered')}
            className="flex flex-col rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-left hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-semibold">Đã giao thành công</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-900 tabular-nums">
              {deliveredCount}
            </div>
            <span className="text-[10px] text-emerald-700 mt-0.5">Đã đối soát COD</span>
          </button>

          {/* 5. Returned */}
          <button
            onClick={() => onSelectOrderStatus('returned')}
            className="flex flex-col rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-left hover:bg-rose-50 transition-colors"
          >
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-semibold">Chuyển hoàn</span>
              <RotateCcw className="h-4 w-4" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-rose-900 tabular-nums">
              {returnedCount}
            </div>
            <span className="text-[10px] text-rose-700 mt-0.5">Khách hủy / không nhận</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Revenue Trend & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Biểu đồ doanh thu theo giờ hôm nay
                </h3>
                <span className="text-xs text-[#64748B]">
                  Đỉnh điểm lúc 20:00 phát sóng Livestream Achat GO
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#0088FF]" />
                  <span className="text-[#64748B]">Doanh thu</span>
                </div>
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div className="mt-8 flex items-end justify-between gap-2 h-48 pt-6 border-b border-[#E2E8F0]">
              {chartPoints.map((pt, i) => {
                const heightPercent = Math.max(12, Math.round((pt.revenue / maxChartRev) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md">
                      <div>{pt.label}</div>
                      <div className="font-mono font-bold">{formatVND(pt.revenue)} ({pt.orders} đơn)</div>
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t-sm transition-all duration-300 ${
                        pt.label.includes('Live')
                          ? 'bg-gradient-to-t from-[#0066CC] to-[#0088FF] ring-2 ring-[#0088FF]/30'
                          : 'bg-[#93C5FD] hover:bg-[#0088FF]'
                      }`}
                    />
                    <span className="text-[10px] text-[#64748B] mt-2 font-mono truncate max-w-full">
                      {pt.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#64748B] pt-2">
            <span>Tổng cộng 8 mốc đo lường</span>
            <span className="font-medium text-[#0088FF]">Livestream mang lại 38% tổng doanh thu</span>
          </div>
        </div>

        {/* Right 1 Col: Sales Channel Contribution */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">
              Kênh bán hàng hiệu quả
            </h3>
            <span className="text-xs text-[#64748B]">
              Phân bổ nguồn đơn hàng trong ngày
            </span>

            <div className="mt-5 space-y-4">
              {channelData.map((ch, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1E293B]">{ch.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                        {formatVND(ch.revenue)}
                      </span>
                      <span className="text-[#64748B] w-8 text-right font-mono text-[11px]">
                        {ch.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      style={{ width: `${ch.percentage}%` }}
                      className={`h-full rounded-full ${ch.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('livestream')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[#0088FF] bg-[#F0F7FF] py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#E5F1FF] transition-colors"
          >
            <Radio className="h-3.5 w-3.5 text-[#0088FF]" />
            <span>Mở giao diện Chốt đơn Live</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Top Best Sellers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Best-Selling Products */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Top sản phẩm bán chạy hôm nay
            </h3>
            <button
              onClick={() => onNavigateToTab('products')}
              className="text-xs font-medium text-[#0088FF] hover:underline"
            >
              Xem tất cả kho
            </button>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {products.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#94A3B8] w-4">
                    #{idx + 1}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-11 w-11 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-[#1E293B] line-clamp-1">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                      <span>Tồn kho: <strong className="font-mono text-[#0F172A]">{p.totalStock}</strong></span>
                      <span>·</span>
                      <span>Giá: <strong className="font-mono text-[#0088FF]">{formatVND(p.basePrice)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-[#0F172A] tabular-nums">
                    {32 - idx * 7} đã bán
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    +{(32 - idx * 7) * p.basePrice > 0 ? formatVND((32 - idx * 7) * p.basePrice) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Stream */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Đơn hàng vừa phát sinh
            </h3>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-xs font-medium text-[#0088FF] hover:underline"
            >
              Xem toàn bộ ({orders.length})
            </button>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {orders.slice(0, 4).map((ord) => {
              const statusBadge = getStatusBadge(ord.status);
              const channelBadge = getChannelBadge(ord.channel);
              return (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0088FF]">
                        {ord.code}
                      </span>
                      <span className="text-[11px] font-medium text-[#1E293B]">
                        {ord.customer.name}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">
                        ({ord.customer.phone})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                      <span>{channelBadge.label}</span>
                      <span>·</span>
                      <span>{ord.items.length} món</span>
                      <span>·</span>
                      <span className="font-mono font-medium text-[#0F172A]">
                        {formatVND(ord.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                    >
                      {statusBadge.label}
                    </span>
                    <button
                      onClick={() => onViewOrder(ord)}
                      className="p-1 rounded-md text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                      title="Xem chi tiết đơn"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
