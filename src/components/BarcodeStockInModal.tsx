import React, { useState } from 'react';
import {
  X,
  ScanBarcode,
  Plus,
  Trash2,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  History,
} from 'lucide-react';
import { Product, ProductVariant, StockInItem, StockInTicket } from '../types';
import { formatVND, formatDate } from '../utils/formatters';

interface BarcodeStockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stockInTickets: StockInTicket[];
  onConfirmStockIn: (ticket: StockInTicket) => void;
  activeBranch: string;
}

export const BarcodeStockInModal: React.FC<BarcodeStockInModalProps> = ({
  isOpen,
  onClose,
  products,
  stockInTickets,
  onConfirmStockIn,
  activeBranch,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [supplierName, setSupplierName] = useState('Xưởng May Gia Công Việt Nhật');
  const [ticketNote, setTicketNote] = useState('Nhập hàng thời trang đợt mới');
  const [stockInItems, setStockInItems] = useState<StockInItem[]>([]);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Scan handler
  const handleScanBarcode = (barcodeToScan?: string) => {
    const code = (barcodeToScan || barcodeInput).trim();
    if (!code) return;

    // Look for product variant matching barcode
    let matchedProd: Product | null = null;
    let matchedVariant: ProductVariant | null = null;

    for (const p of products) {
      const v = p.variants.find((variant) => variant.barcode === code || variant.sku === code);
      if (v) {
        matchedProd = p;
        matchedVariant = v;
        break;
      }
    }

    if (!matchedProd || !matchedVariant) {
      setScanMessage(`Không tìm thấy sản phẩm có mã vạch ${code}`);
      setTimeout(() => setScanMessage(null), 3000);
      return;
    }

    // Add or increment
    const existingIndex = stockInItems.findIndex((it) => it.barcode === matchedVariant!.barcode);
    if (existingIndex >= 0) {
      const updated = [...stockInItems];
      updated[existingIndex].quantity += 1;
      setStockInItems(updated);
    } else {
      setStockInItems([
        ...stockInItems,
        {
          barcode: matchedVariant.barcode,
          sku: matchedVariant.sku,
          productName: matchedProd.name,
          color: matchedVariant.color,
          size: matchedVariant.size,
          quantity: 10,
          costPrice: matchedVariant.costPrice,
        },
      ]);
    }

    setScanMessage(`Đã quét thành công: ${matchedProd.name} (${matchedVariant.color}/${matchedVariant.size})`);
    setTimeout(() => setScanMessage(null), 2500);
    setBarcodeInput('');
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...stockInItems];
    updated[index].quantity = newQty;
    setStockInItems(updated);
  };

  const handleUpdateItemCost = (index: number, newCost: number) => {
    const updated = [...stockInItems];
    updated[index].costPrice = newCost;
    setStockInItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setStockInItems(stockInItems.filter((_, i) => i !== index));
  };

  const totalQuantity = stockInItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalCost = stockInItems.reduce((acc, it) => acc + it.quantity * it.costPrice, 0);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockInItems.length === 0) {
      alert('Vui lòng quét hoặc thêm ít nhất một sản phẩm cần nhập kho!');
      return;
    }

    const newTicket: StockInTicket = {
      id: `pnk-${Date.now()}`,
      code: `PNK${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      supplier: supplierName,
      branch: activeBranch,
      items: stockInItems,
      totalQuantity,
      totalCost,
      note: ticketNote,
    };

    onConfirmStockIn(newTicket);
    setStockInItems([]);
    setActiveTab('history');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0088FF] text-white">
              <ScanBarcode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Nhập kho theo mã vạch Barcode (Achat Warehouse)
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Quét mã vạch tự động nhận diện SKU, tăng tồn kho và ghi nhận công nợ nhà cung cấp.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-[#64748B] hover:bg-[#E2E8F0]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E2E8F0] px-6 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 mr-6 border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-[#0088FF] text-[#0088FF] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Tạo phiếu nhập mới (Quét Barcode)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#0088FF] text-[#0088FF] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Lịch sử phiếu nhập kho ({stockInTickets.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto text-xs space-y-4">
          {activeTab === 'create' ? (
            <>
              {/* Barcode Scanner Box */}
              <div className="rounded-xl border-2 border-dashed border-[#0088FF] bg-[#F0F7FF] p-4 text-center">
                <div className="flex items-center justify-center gap-2 font-bold text-[#0088FF] mb-2">
                  <ScanBarcode className="h-5 w-5" />
                  <span>MÁY QUÉT MÃ VẠCH ĐANG SẴN SÀNG</span>
                </div>
                <p className="text-[11px] text-[#475569] mb-3">
                  Quét súng quét barcode hoặc gõ mã vạch rồi nhấn Enter để tự động thêm sản phẩm vào phiếu nhập.
                </p>

                <div className="flex max-w-md mx-auto gap-2">
                  <input
                    type="text"
                    placeholder="Quét mã vạch (893600... hoặc SM01)..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScanBarcode();
                      }
                    }}
                    className="flex-1 rounded-lg border border-[#93C5FD] bg-white px-3 py-2 text-xs font-mono font-bold text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                  <button
                    type="button"
                    onClick={() => handleScanBarcode()}
                    className="rounded-lg bg-[#0088FF] px-4 py-2 font-bold text-white hover:bg-[#0077E6]"
                  >
                    Quét
                  </button>
                </div>

                {/* Quick Barcode Presets for Test */}
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-[10px]">
                  <span className="text-[#64748B]">Mã vạch thử nhanh:</span>
                  <button
                    type="button"
                    onClick={() => handleScanBarcode('893600102')}
                    className="rounded bg-white border border-[#93C5FD] px-2 py-0.5 font-mono text-[#0088FF] hover:bg-[#EFF6FF]"
                  >
                    893600102 (Sơ mi Be M)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScanBarcode('893600202')}
                    className="rounded bg-white border border-[#93C5FD] px-2 py-0.5 font-mono text-[#0088FF] hover:bg-[#EFF6FF]"
                  >
                    893600202 (Thun Đen L)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScanBarcode('893600403')}
                    className="rounded bg-white border border-[#93C5FD] px-2 py-0.5 font-mono text-[#0088FF] hover:bg-[#EFF6FF]"
                  >
                    893600403 (Sneaker 40)
                  </button>
                </div>
              </div>

              {scanMessage && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-emerald-800 font-medium text-center">
                  {scanMessage}
                </div>
              )}

              {/* Supplier info */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E2E8F0] p-3.5 bg-white">
                <div>
                  <label className="font-semibold text-[#475569]">Nhà cung cấp / Xưởng may</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#475569]">Ghi chú đợt nhập</label>
                  <input
                    type="text"
                    value={ticketNote}
                    onChange={(e) => setTicketNote(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-1.5 outline-none"
                  />
                </div>
              </div>

              {/* Scanned Items Table */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                      <th className="p-3">Mã vạch & SKU</th>
                      <th className="p-3">Tên sản phẩm</th>
                      <th className="p-3 text-center">SL Nhập</th>
                      <th className="p-3 text-right">Giá vốn nhập</th>
                      <th className="p-3 text-right">Thành tiền</th>
                      <th className="p-3 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {stockInItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#94A3B8]">
                          Chưa có sản phẩm nào được quét. Vui lòng quét mã vạch ở ô phía trên!
                        </td>
                      </tr>
                    ) : (
                      stockInItems.map((it, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="p-3 font-mono font-bold text-[#0F172A]">
                            <div>{it.barcode}</div>
                            <div className="text-[10px] text-[#64748B]">{it.sku}</div>
                          </td>
                          <td className="p-3 font-medium text-[#1E293B]">
                            {it.productName} ({it.color}/{it.size})
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => handleUpdateItemQty(idx, Number(e.target.value))}
                              className="w-16 text-center font-mono font-bold border border-[#CBD5E1] rounded px-1 py-0.5 text-xs text-[#0F172A]"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              value={it.costPrice}
                              onChange={(e) => handleUpdateItemCost(idx, Number(e.target.value))}
                              className="w-24 text-right font-mono border border-[#CBD5E1] rounded px-1 py-0.5 text-xs text-[#0F172A]"
                            />
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#0088FF]">
                            {formatVND(it.quantity * it.costPrice)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-[#94A3B8] hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Total Summary */}
                {stockInItems.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] font-bold">
                    <span>Tổng số lượng: <strong className="font-mono text-[#0088FF]">{totalQuantity} sản phẩm</strong></span>
                    <span>Tổng tiền nhập: <strong className="font-mono text-[#0F172A] text-sm">{formatVND(totalCost)}</strong></span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* History of past stock-in tickets */
            <div className="space-y-3">
              {stockInTickets.map((tk) => (
                <div key={tk.id} className="rounded-xl border border-[#E2E8F0] p-4 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#0088FF]">{tk.code}</span>
                    <span className="text-[#64748B] font-mono text-[11px]">{formatDate(tk.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#1E293B]">Nhà cung cấp: {tk.supplier}</span>
                    <span>·</span>
                    <span className="text-[#64748B]">{tk.branch}</span>
                  </div>
                  <div className="text-[11px] text-[#475569] bg-[#F8FAFC] p-2 rounded-lg">
                    {tk.items.map((it) => `${it.productName} (${it.quantity} cái)`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] font-bold">
                    <span>Tổng nhập: {tk.totalQuantity || tk.totalItems || 0} món</span>
                    <span className="font-mono text-[#0088FF]">{formatVND(tk.totalCost || tk.totalAmount || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-3.5 bg-[#F8FAFC]">
          <span className="text-[11px] text-[#64748B]">
            Chi nhánh: <strong>{activeBranch}</strong>
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 font-semibold text-[#475569] hover:bg-[#F1F5F9]"
            >
              Đóng
            </button>
            {activeTab === 'create' && stockInItems.length > 0 && (
              <button
                type="button"
                onClick={handleSubmitTicket}
                className="rounded-lg bg-[#0088FF] px-5 py-2 font-bold text-white hover:bg-[#0077E6] shadow-xs"
              >
                Xác nhận Nhập kho & Tăng tồn
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
