import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Check,
  Copy,
  Truck,
  Download,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  QrCode,
  Package,
} from 'lucide-react';
import { Order, ShippingCarrierId } from '../types';
import { formatVND, formatDate } from '../utils/formatters';

interface PrintInvoiceModalProps {
  order: Order | null;
  ordersToPrint?: Order[];
  onClose: () => void;
}

export type BatchSize = 20 | 50 | 100 | 200 | 500;

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  order,
  ordersToPrint,
  onClose,
}) => {
  // Determine list of orders to print
  const allOrders = useMemo(() => {
    if (ordersToPrint && ordersToPrint.length > 0) return ordersToPrint;
    if (order) return [order];
    return [];
  }, [order, ordersToPrint]);

  if (allOrders.length === 0) return null;

  const isBulk = allOrders.length > 1;

  // Batch partitioning state (20, 50, 100, 200, 500)
  const [batchSize, setBatchSize] = useState<BatchSize>(20);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  // Template layout: Achat Standard A5 / A6 / K80 / 100x150mm
  const [paperFormat, setPaperFormat] = useState<'a5' | 'k80' | '100x150'>('100x150');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute batches
  const totalBatches = Math.max(1, Math.ceil(allOrders.length / batchSize));
  const activeBatchIndex = Math.min(currentBatchIndex, totalBatches - 1);

  const currentBatchOrders = useMemo(() => {
    const start = activeBatchIndex * batchSize;
    return allOrders.slice(start, start + batchSize);
  }, [allOrders, activeBatchIndex, batchSize]);

  // Generate SVG Code128 barcode simulation
  const renderBarcodeSvg = (code: string) => {
    // Generate pseudo barcode bars based on char codes
    const bars: boolean[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      bars.push(true, false, charCode % 2 === 0, true, true, false, charCode % 3 === 0, false);
    }
    bars.push(true, true, false, true);

    return (
      <div className="flex flex-col items-center">
        <svg className="h-10 w-48" viewBox={`0 0 ${bars.length * 2} 40`} preserveAspectRatio="none">
          {bars.map((isBlack, idx) => (
            <rect
              key={idx}
              x={idx * 2}
              y="0"
              width="2"
              height="40"
              fill={isBlack ? '#000000' : 'transparent'}
            />
          ))}
        </svg>
        <span className="font-mono font-bold tracking-widest text-xs mt-0.5 text-black">
          {code}
        </span>
      </div>
    );
  };

  // Build standalone Printable HTML content
  const generatePrintableHtml = (ordersList: Order[]) => {
    const isThermal = paperFormat === 'k80';
    const isSticker = paperFormat === '100x150';

    const styles = `
      <style>
        @page {
          size: ${isThermal ? '80mm auto' : isSticker ? '100mm 150mm' : 'A5 portrait'};
          margin: ${isThermal ? '3mm' : isSticker ? '5mm' : '8mm'};
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .bill-card {
          width: 100%;
          border: 2px solid #000;
          page-break-after: always;
          break-after: page;
          margin-bottom: 20px;
          padding: 10px;
          font-size: 11px;
        }
        .bill-card:last-child {
          page-break-after: auto;
          break-after: auto;
          margin-bottom: 0;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .border-b { border-bottom: 1px solid #000; }
        .border-t { border-top: 1px solid #000; }
        .border-r { border-right: 1px solid #000; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #000; padding: 4px 6px; font-size: 10px; }
        th { background: #eee; font-weight: bold; }
        .badge { display: inline-block; padding: 2px 6px; background: #000; color: #fff; font-weight: bold; font-size: 10px; border-radius: 3px; }
        .sort-code { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
        .cod-box { font-size: 16px; font-weight: 900; border: 2px dashed #000; padding: 6px; text-align: center; margin-top: 6px; }
      </style>
    `;

    const cardsHtml = ordersList
      .map((ord, idx) => {
        const carrierName = (ord.carrierId || 'J&T').toUpperCase();
        const tracking = ord.trackingCode || `VN${ord.code}`;
        const sort = ord.sortCode || 'HAN-CG-01';

        const itemsRows = ord.items
          .map(
            (it) => `
          <tr>
            <td><strong>${it.productName}</strong><br/><small>SKU: ${it.sku}${it.size ? ` | Sz: ${it.size}` : ''}${it.color ? ` | M: ${it.color}` : ''}</small></td>
            <td class="text-center font-bold">${it.quantity}</td>
            <td class="text-right">${formatVND(it.price)}</td>
            <td class="text-right font-bold">${formatVND(it.total)}</td>
          </tr>
        `
          )
          .join('');

        return `
        <div class="bill-card">
          <!-- Header Bar -->
          <div class="flex justify-between items-center border-b" style="padding-bottom: 8px;">
            <div>
              <div style="font-size: 14px; font-weight: bold;">ACHAT GO · PHIẾU GIAO HÀNG</div>
              <div>Cửa hàng: <strong>${ord.sourcePageName || 'Shop Bé Đan'}</strong></div>
            </div>
            <div class="text-right">
              <span class="badge">${carrierName} EXPRESS</span>
              <div class="sort-code">${sort}</div>
            </div>
          </div>

          <!-- Barcode & Tracking -->
          <div class="text-center" style="padding: 8px 0; border-bottom: 1px solid #000;">
            <div style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 3px;">*${tracking}*</div>
            <div style="font-size: 11px; font-weight: bold;">Mã vận đơn: ${tracking} · Mã đơn hàng: ${ord.code}</div>
          </div>

          <!-- Sender & Receiver -->
          <div class="grid-2 border-b" style="padding: 6px 0;">
            <div style="padding-right: 8px; border-right: 1px solid #000;">
              <div class="font-bold">TỪ (NGƯỜI GỬI):</div>
              <div>${ord.sourcePageName || 'Shop Bé Đan'} (binbinbobo999)</div>
              <div>Hotline: 0916636785</div>
              <div>Kho xuất: 45 Lê Văn Sỹ, P13, Q3, TP. Hồ Chí Minh</div>
            </div>
            <div style="padding-left: 8px;">
              <div class="font-bold">ĐẾN (NGƯỜI NHẬN):</div>
              <div style="font-size: 13px; font-weight: bold;">${ord.customer.name}</div>
              <div style="font-size: 13px; font-weight: bold; color: #000;">SĐT: ${ord.customer.phone}</div>
              <div>Đ/c: ${ord.customer.address}, ${ord.customer.ward || ''}, ${ord.customer.district || ''}, ${ord.customer.city || ''}</div>
            </div>
          </div>

          <!-- Products Table -->
          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm / Phân loại</th>
                <th style="width: 40px;" class="text-center">SL</th>
                <th style="width: 70px;" class="text-right">Đơn giá</th>
                <th style="width: 80px;" class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Financial & COD Box -->
          <div class="flex justify-between items-center" style="margin-top: 8px;">
            <div style="flex: 1; padding-right: 10px;">
              <div>Tổng tiền hàng: <strong>${formatVND(ord.subtotal)}</strong></div>
              <div>Phí vận chuyển: <strong>${formatVND(ord.shippingFee)}</strong></div>
              ${ord.discountAmount ? `<div>Giảm giá: <strong>-${formatVND(ord.discountAmount)}</strong></div>` : ''}
              <div style="font-size: 12px; margin-top: 4px;">Tổng thu người nhận: <strong>${formatVND(ord.totalAmount)}</strong></div>
            </div>

            <div class="cod-box" style="flex: 1;">
              <div style="font-size: 10px; font-weight: normal;">TIỀN THU NGƯỜI NHẬN (COD)</div>
              <div>${ord.isPaid ? 'ĐÃ THANH TOÁN (0 Đ)' : formatVND(ord.totalAmount)}</div>
            </div>
          </div>

          <!-- Footer Instructions -->
          <div style="margin-top: 8px; border-top: 1px solid #000; padding-top: 4px; font-size: 9px; display: flex; justify-content: space-between;">
            <div>
              <strong>Chỉ dẫn giao hàng:</strong> Cho xem hàng, không cho thử.<br/>
              <strong>Ghi chú:</strong> ${ord.noteForShipper || 'Giao giờ hành chính, gọi trước khi giao.'}
            </div>
            <div class="text-right">
              Chữ ký người nhận<br/><br/><br/>
              .............................
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>In Đơn Hàng Achat GO (${ordersList.length} đơn)</title>${styles}</head><body>${cardsHtml}</body></html>`;
  };

  // Trigger Native Print / Save as PDF
  const handlePrintCurrentBatch = () => {
    const html = generatePrintableHtml(currentBatchOrders);
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      // Fallback: print directly via hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(html);
      iframe.contentDocument?.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1500);
      }, 350);
    }
  };

  // Download Printable HTML / PDF Source file
  const handleDownloadHtmlFile = () => {
    setIsGeneratingPdf(true);
    try {
      const html = generatePrintableHtml(currentBatchOrders);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AchatGO_InPhieu_${currentBatchOrders.length}_Don_${new Date().toISOString().slice(0, 10)}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC] gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0088FF] text-white shadow-md">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  In phiếu giao hàng &amp; Xuất PDF ({allOrders.length} đơn)
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0088FF]">
                  Chuẩn Achat GO
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                In trực tiếp máy in nhiệt K80 / Máy in A4-A5 hoặc lưu dưới dạng PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Paper format selector */}
            <div className="flex rounded-lg border border-[#CBD5E1] bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPaperFormat('100x150')}
                className={`rounded px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  paperFormat === '100x150' ? 'bg-[#0088FF] text-white' : 'text-[#64748B]'
                }`}
              >
                100x150 (Decal)
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('a5')}
                className={`rounded px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  paperFormat === 'a5' ? 'bg-[#0088FF] text-white' : 'text-[#64748B]'
                }`}
              >
                A5 / A4
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('k80')}
                className={`rounded px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  paperFormat === 'k80' ? 'bg-[#0088FF] text-white' : 'text-[#64748B]'
                }`}
              >
                K80 (Bill)
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrintCurrentBatch}
              className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] hover:bg-[#0077E6] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>In {currentBatchOrders.length} đơn (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlFile}
              className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] px-3 py-2 text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
              title="Tải file in lưu máy"
            >
              <Download className="h-4 w-4 text-[#0088FF]" />
              <span className="hidden sm:inline">Tải file</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Batch Pagination Control Bar (Chia đợt in 20, 50, 100, 200, 500 đơn) */}
        {allOrders.length > 20 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] px-6 py-2.5 bg-blue-50/70 text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F172A] flex items-center gap-1">
                <Layers className="h-4 w-4 text-[#0088FF]" />
                <span>Chia trang in:</span>
              </span>

              <div className="flex items-center gap-1">
                {([20, 50, 100, 200, 500] as BatchSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setBatchSize(size);
                      setCurrentBatchIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      batchSize === size
                        ? 'bg-[#0088FF] text-white shadow-2xs'
                        : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-100'
                    }`}
                  >
                    {size} đơn
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#64748B] text-xs">
                Đợt <strong>{activeBatchIndex + 1}</strong> / {totalBatches} (Đơn {activeBatchIndex * batchSize + 1} -{' '}
                {Math.min((activeBatchIndex + 1) * batchSize, allOrders.length)} trong tổng số {allOrders.length} đơn)
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activeBatchIndex === 0}
                  onClick={() => setCurrentBatchIndex((prev) => Math.max(0, prev - 1))}
                  className="rounded p-1 border border-[#CBD5E1] bg-white text-[#475569] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={activeBatchIndex >= totalBatches - 1}
                  onClick={() => setCurrentBatchIndex((prev) => Math.min(totalBatches - 1, prev + 1))}
                  className="rounded p-1 border border-[#CBD5E1] bg-white text-[#475569] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Container */}
        <div className="p-6 bg-slate-100 flex flex-col items-center gap-6 overflow-y-auto flex-1 max-h-[70vh]">
          {currentBatchOrders.map((ord, idx) => {
            const carrierId = (ord.carrierId || 'jnt').toLowerCase();
            const tracking = ord.trackingCode || `VN${ord.code}`;
            const sort = ord.sortCode || 'HAN-CG-01';

            return (
              <div
                key={ord.id}
                className="w-full max-w-[440px] bg-white border-2 border-black p-4 text-[11px] text-black shadow-md rounded-xs select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-black text-white font-extrabold text-xs">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">ACHAT GO EXPRESS</div>
                      <div className="text-[10px] text-gray-700">Mã: {ord.code}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-black px-2 py-0.5 font-bold text-[10px] text-white tracking-wider">
                      {(ord.carrierId || 'J&T').toUpperCase()}
                    </span>
                    <div className="text-sm font-black tracking-wider mt-0.5">{sort}</div>
                  </div>
                </div>

                {/* Barcode */}
                <div className="border-b-2 border-black py-2.5 text-center">
                  {renderBarcodeSvg(tracking)}
                </div>

                {/* Sender & Receiver */}
                <div className="grid grid-cols-2 border-b-2 border-black py-2 gap-2">
                  <div className="border-r border-black pr-2">
                    <div className="font-bold text-[10px] text-gray-600 uppercase">Từ (Người gửi):</div>
                    <div className="font-bold text-xs">{ord.sourcePageName || 'Shop Bé Đan'}</div>
                    <div className="text-[10px] text-gray-700">Hotline: 0988.999.888</div>
                    <div className="text-[10px] text-gray-600 leading-tight mt-0.5">
                      45 Lê Văn Sỹ, P13, Q3, TP. Hồ Chí Minh
                    </div>
                  </div>

                  <div className="pl-1">
                    <div className="font-bold text-[10px] text-gray-600 uppercase">Đến (Người nhận):</div>
                    <div className="font-bold text-xs text-black">{ord.customer.name}</div>
                    <div className="font-mono font-bold text-xs text-black">
                      SĐT: {ord.customer.phone}
                    </div>
                    <div className="text-[10px] text-gray-800 leading-tight mt-0.5">
                      {ord.customer.address}, {ord.customer.ward || ''}, {ord.customer.district || ''},{' '}
                      {ord.customer.city || ''}
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="border-b-2 border-black py-2">
                  <div className="font-bold text-[10px] uppercase text-gray-600 mb-1">
                    Nội dung hàng hóa ({ord.items.length} món):
                  </div>
                  <div className="divide-y divide-gray-200">
                    {ord.items.map((item, i) => (
                      <div key={i} className="py-1 flex items-center justify-between">
                        <div className="max-w-[280px]">
                          <span className="font-semibold text-black">{item.productName}</span>
                          <span className="text-[10px] text-gray-600 ml-1">
                            ({item.sku}
                            {item.color ? ` - ${item.color}` : ''}
                            {item.size ? ` - Sz ${item.size}` : ''})
                          </span>
                        </div>
                        <div className="font-bold font-mono">SL: {item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COD & Amount Box */}
                <div className="border-b-2 border-black py-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-600">Tổng tiền hàng: {formatVND(ord.subtotal)}</div>
                    <div className="text-[10px] text-gray-600">Phí giao hàng: {formatVND(ord.shippingFee)}</div>
                    <div className="font-bold text-xs mt-0.5">Giá trị đơn: {formatVND(ord.totalAmount)}</div>
                  </div>

                  <div className="border-2 border-dashed border-black rounded p-2 text-center min-w-[150px]">
                    <div className="text-[10px] font-bold text-gray-600">TIỀN THU NGƯỜI NHẬN</div>
                    <div className="text-base font-black font-mono">
                      {ord.isPaid ? 'ĐÃ THANH TOÁN (0 Đ)' : formatVND(ord.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-2 text-[10px] flex items-start justify-between">
                  <div className="max-w-[260px] leading-tight">
                    <div>
                      <strong>Chỉ dẫn:</strong> Cho xem hàng, không cho thử.
                    </div>
                    <div className="text-gray-700 mt-0.5">
                      <strong>Ghi chú shipper:</strong>{' '}
                      {ord.noteForShipper || 'Giao giờ hành chính, gọi trước khi giao.'}
                    </div>
                  </div>
                  <div className="text-right text-gray-600 text-[9px]">
                    Chữ ký người nhận
                    <div className="mt-5">........................</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[#64748B]">
            Đang hiển thị đợt in gồm <strong>{currentBatchOrders.length}</strong> đơn / tổng số{' '}
            <strong>{allOrders.length}</strong> đơn được chọn.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintCurrentBatch}
              className="rounded-lg bg-[#0088FF] hover:bg-[#0077E6] px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>In ngay đợt này ({currentBatchOrders.length} đơn)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
