import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag, Package, User, ArrowRight } from 'lucide-react';
import { Customer, Order, Product } from '../types';
import { formatVND } from '../utils/formatters';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  customers: Customer[];
  onSelectOrder: (order: Order) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  customers,
  onSelectOrder,
  onSelectCustomer,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.trackingCode.toLowerCase().includes(q)
      )
    : [];

  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(q))
      )
    : [];

  const matchedCustomers = q
    ? customers.filter(
        (c) => c.phone.includes(q) || c.name.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-xs p-4 pt-16">
      <div className="w-full max-w-2xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#E2E8F0] px-4 py-3 bg-white">
          <Search className="h-5 w-5 text-[#94A3B8] mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Tìm đơn hàng (SON100...), SĐT khách (09...), hoặc mã SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-[#94A3B8]">
              Nhập mã đơn, số điện thoại khách hoặc mã sản phẩm để tìm kiếm nhanh
            </div>
          ) : (
            <>
              {/* Orders results */}
              {matchedOrders.length > 0 && (
                <div>
                  <div className="font-bold text-[#64748B] uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-[#0088FF]" />
                    Đơn hàng ({matchedOrders.length})
                  </div>
                  <div className="space-y-1">
                    {matchedOrders.map((ord) => (
                      <button
                        key={ord.id}
                        onClick={() => {
                          onSelectOrder(ord);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0088FF]">{ord.code}</span>
                            <span className="font-semibold text-[#1E293B]">{ord.customer.name}</span>
                            <span className="font-mono text-[#64748B]">{ord.customer.phone}</span>
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">
                            Vận đơn: {ord.trackingCode} · {ord.items.length} món
                          </div>
                        </div>
                        <div className="font-mono font-bold text-[#0F172A]">
                          {formatVND(ord.totalAmount)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers results */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="font-bold text-[#64748B] uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#0088FF]" />
                    Khách hàng ({matchedCustomers.length})
                  </div>
                  <div className="space-y-1">
                    {matchedCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors text-left"
                      >
                        <div>
                          <span className="font-semibold text-[#1E293B]">{c.name}</span>
                          <span className="ml-2 font-mono text-[#0088FF]">{c.phone}</span>
                          <div className="text-[11px] text-[#64748B]">{c.city}</div>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          {c.completedOrders} đơn thành công
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products results */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="font-bold text-[#64748B] uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-[#0088FF]" />
                    Sản phẩm ({matchedProducts.length})
                  </div>
                  <div className="space-y-1">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC]"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={p.image} alt={p.name} className="h-8 w-8 rounded object-cover" />
                          <div>
                            <div className="font-semibold text-[#1E293B]">{p.name}</div>
                            <div className="text-[11px] text-[#64748B] font-mono">
                              Kho: {p.totalStock} sp
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#0088FF]">
                          {formatVND(p.basePrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedOrders.length === 0 && matchedCustomers.length === 0 && matchedProducts.length === 0 && (
                <div className="py-6 text-center text-[#64748B]">
                  Không tìm thấy kết quả nào khớp với "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
