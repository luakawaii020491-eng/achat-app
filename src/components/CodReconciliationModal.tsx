import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Download,
  Upload,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types';
import { formatVND } from '../utils/formatters';

export interface ReconciliationItemResult {
  inputCode: string;
  inputAmount: number;
  matchedOrder?: Order;
  systemAmount?: number;
  diffAmount: number; // inputAmount - systemAmount (0 = match, != 0 = mismatch)
  status: 'matched' | 'amount_mismatch' | 'not_found' | 'invalid_format';
  note: string;
}

interface CodReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onBatchConfirmPaid?: (orderIds: string[]) => void;
}

export const CodReconciliationModal: React.FC<CodReconciliationModalProps> = ({
  isOpen,
  onClose,
  orders,
  onBatchConfirmPaid,
}) => {
  if (!isOpen) return null;

  // Text input for copy-pasting
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mismatch' | 'matched' | 'not_found'>('all');
  const [results, setResults] = useState<ReconciliationItemResult[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState<string | null>(null);

  // Sample data to try
  const sampleReconciliationText = orders.slice(0, 4).map((o, idx) => {
    // Make 1 intentionally mismatched by 20,000đ to demonstrate error highlighting!
    const amount = idx === 1 ? o.totalAmount - 20000 : o.totalAmount;
    return `${o.code}\t${amount}`;
  }).join('\n') + `\nSON99999\t150000\n${orders[4]?.trackingCode || 'JT88921045'}\t${orders[4]?.totalAmount || 240000}`;

  const handleLoadSample = () => {
    setInputText(sampleReconciliationText);
  };

  // Run reconciliation algorithm
  const handleRunReconciliation = () => {
    if (!inputText.trim()) return;

    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsedResults: ReconciliationItemResult[] = [];

    for (const line of lines) {
      // Split by tab, comma, semicolon, space or pipe
      // E.g. "SON10293  350000" or "SON10293,350000" or "JT88921045: 250.000"
      const cleanedLine = line.replace(/đ|VND|vnđ|\./g, '').trim();

      // Regex matching code and amount
      // Code is usually alphanumerical (e.g. SON12345, JT88291, BEST9901)
      const parts = cleanedLine.split(/[\t,;:]+|\s{2,}/).map((p) => p.trim()).filter(Boolean);

      let rawCode = '';
      let rawAmount = 0;

      if (parts.length >= 2) {
        rawCode = parts[0];
        // Parse numbers from the second part
        const numMatch = parts[1].replace(/[^\d-]/g, '');
        rawAmount = parseInt(numMatch, 10) || 0;
      } else {
        // Fallback: search with regex in single line
        const codeMatch = cleanedLine.match(/\b([A-Za-z0-9_-]{5,20})\b/);
        const amountMatch = cleanedLine.match(/(\d{4,9})/);
        if (codeMatch && amountMatch) {
          rawCode = codeMatch[1];
          rawAmount = parseInt(amountMatch[1], 10);
        }
      }

      if (!rawCode) {
        parsedResults.push({
          inputCode: line,
          inputAmount: 0,
          diffAmount: 0,
          status: 'invalid_format',
          note: 'Dòng sai định dạng (không tìm thấy mã đơn/vận đơn)',
        });
        continue;
      }

      // Search matching order by code, trackingCode, or id
      const cleanSearchCode = rawCode.toLowerCase();
      const matchedOrder = orders.find(
        (o) =>
          o.code.toLowerCase() === cleanSearchCode ||
          (o.trackingCode && o.trackingCode.toLowerCase() === cleanSearchCode) ||
          o.id.toLowerCase() === cleanSearchCode
      );

      if (!matchedOrder) {
        parsedResults.push({
          inputCode: rawCode,
          inputAmount: rawAmount,
          diffAmount: 0,
          status: 'not_found',
          note: 'Mã đơn không tồn tại trên hệ thống Achat GO',
        });
      } else {
        const sysAmount = matchedOrder.totalAmount;
        const diff = rawAmount - sysAmount;

        if (diff === 0) {
          parsedResults.push({
            inputCode: rawCode,
            inputAmount: rawAmount,
            matchedOrder,
            systemAmount: sysAmount,
            diffAmount: 0,
            status: 'matched',
            note: matchedOrder.isPaid ? 'Khớp tiền 100% (Đơn đã thanh toán trước)' : 'Khớp tiền 100% (Sẵn sàng xác nhận thanh toán)',
          });
        } else {
          const diffText = diff > 0 ? `Thừa +${formatVND(diff)}` : `Thiếu ${formatVND(diff)}`;
          parsedResults.push({
            inputCode: rawCode,
            inputAmount: rawAmount,
            matchedOrder,
            systemAmount: sysAmount,
            diffAmount: diff,
            status: 'amount_mismatch',
            note: `Lệch số tiền: Hệ thống ${formatVND(sysAmount)}, Tiền chuyển ${formatVND(rawAmount)} (${diffText})`,
          });
        }
      }
    }

    setResults(parsedResults);
    setHasAnalyzed(true);
  };

  // Confirm paid for all matched orders
  const handleConfirmAllMatched = () => {
    const matchedOrders = results
      .filter((r) => r.status === 'matched' && r.matchedOrder && !r.matchedOrder.isPaid)
      .map((r) => r.matchedOrder!.id);

    if (matchedOrders.length === 0) {
      alert('Không có đơn nào cần cập nhật thanh toán.');
      return;
    }

    if (onBatchConfirmPaid) {
      onBatchConfirmPaid(matchedOrders);
      setAppliedSuccessMsg(`Đã cập nhật thanh toán thành công cho ${matchedOrders.length} đơn hàng khớp đối soát!`);
      setTimeout(() => setAppliedSuccessMsg(null), 3500);
    }
  };

  // Export report as CSV text
  const handleExportCsv = () => {
    const header = 'Mã Đơn / Vận Đơn,Tiền Đã Chuyển,Tiền Hệ Thống,Chênh Lệch,Trạng Thái,Ghi Chú Chi Tiết\n';
    const rows = results
      .map((r) => {
        const st =
          r.status === 'matched'
            ? 'KHỚP'
            : r.status === 'amount_mismatch'
            ? 'LỆCH TIỀN'
            : r.status === 'not_found'
            ? 'KHÔNG TỒN TẠI'
            : 'SAI ĐỊNH DẠNG';
        return `"${r.inputCode}",${r.inputAmount},${r.systemAmount || 0},${r.diffAmount},"${st}","${r.note}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AchatGO_DoiSoat_ChuyenTien_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalChecked = results.length;
  const matchedCount = results.filter((r) => r.status === 'matched').length;
  const mismatchCount = results.filter((r) => r.status === 'amount_mismatch').length;
  const notFoundCount = results.filter((r) => r.status === 'not_found' || r.status === 'invalid_format').length;

  const totalInputMoney = results.reduce((acc, r) => acc + (r.inputAmount || 0), 0);
  const totalSystemMoney = results.reduce((acc, r) => acc + (r.systemAmount || 0), 0);
  const totalDiffMoney = totalInputMoney - totalSystemMoney;

  const filteredResults = results.filter((r) => {
    if (activeTab === 'matched' && r.status !== 'matched') return false;
    if (activeTab === 'mismatch' && r.status !== 'amount_mismatch') return false;
    if (activeTab === 'not_found' && r.status !== 'not_found' && r.status !== 'invalid_format') return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return (
        r.inputCode.toLowerCase().includes(q) ||
        r.matchedOrder?.customer.name.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Đối soát tiền chuyển khoản &amp; Tiền thu hộ COD
                </h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Tự động so khớp mã đơn &amp; số tiền
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Copy mã đơn và số tiền từ ngân hàng / hãng vận chuyển dán vào đây để kiểm tra lệch ở đâu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Step 1: Input text / Copy area */}
          <div className="rounded-xl border border-[#CBD5E1] p-4 bg-[#F8FAFC] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Dán danh sách mã đơn &amp; số tiền cần đối soát:</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] text-[#0088FF] font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Dán dữ liệu mẫu kiểm thử</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-[11px] text-[#64748B] hover:text-rose-600"
                >
                  Xóa trắng
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Định dạng: Mã_Đơn [tab hoặc dấu cách] Số_Tiền
Ví dụ:
SON10293    350000
SON88219    240000
JT88921045  195000"
              className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 font-mono text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#64748B]">
                Hỗ trợ copy trực tiếp 2 cột từ Excel hoặc sao kê ngân hàng / hãng vận chuyển.
              </span>
              <button
                type="button"
                onClick={handleRunReconciliation}
                disabled={!inputText.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-bold text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Kiểm tra &amp; So khớp đối soát</span>
              </button>
            </div>
          </div>

          {appliedSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{appliedSuccessMsg}</span>
            </div>
          )}

          {/* Step 2: Results & Summary */}
          {hasAnalyzed && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-2xs">
                  <div className="text-[11px] text-[#64748B] font-medium">Tổng dòng kiểm tra</div>
                  <div className="text-xl font-bold font-mono text-[#0F172A] mt-1">{totalChecked}</div>
                  <div className="text-[10px] text-[#94A3B8]">Mã đơn / vận đơn</div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-2xs">
                  <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Khớp chuẩn 100%</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{matchedCount}</div>
                  <div className="text-[10px] text-emerald-600">Mã đơn &amp; số tiền trùng khớp</div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 shadow-2xs">
                  <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Lệch số tiền</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-1">{mismatchCount}</div>
                  <div className="text-[10px] text-amber-700 font-semibold">
                    {totalDiffMoney !== 0 ? `Chênh: ${totalDiffMoney > 0 ? '+' : ''}${formatVND(totalDiffMoney)}` : 'Cần đối chiếu'}
                  </div>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 shadow-2xs">
                  <div className="text-[11px] text-rose-800 font-medium flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Không tìm thấy</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-700 mt-1">{notFoundCount}</div>
                  <div className="text-[10px] text-rose-600">Không có trên hệ thống shop</div>
                </div>
              </div>

              {/* Action buttons & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-[#0088FF] text-white'
                        : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({results.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('mismatch')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      activeTab === 'mismatch'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    Lệch tiền ({mismatchCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('matched')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      activeTab === 'matched'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Khớp chuẩn ({matchedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('not_found')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      activeTab === 'not_found'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                    }`}
                  >
                    Không tìm thấy ({notFoundCount})
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Xuất file Excel/CSV</span>
                  </button>

                  {matchedCount > 0 && onBatchConfirmPaid && (
                    <button
                      type="button"
                      onClick={handleConfirmAllMatched}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Xác nhận đã thu ({matchedCount} đơn)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Results Table */}
              <div className="rounded-xl border border-[#CBD5E1] overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Mã đơn / Vận đơn</th>
                        <th className="py-2.5 px-3">Khách hàng</th>
                        <th className="py-2.5 px-3 text-right">Tiền đã chuyển</th>
                        <th className="py-2.5 px-3 text-right">Tiền hệ thống</th>
                        <th className="py-2.5 px-3 text-right">Chênh lệch</th>
                        <th className="py-2.5 px-3">Tình trạng đối soát</th>
                        <th className="py-2.5 px-3">Chi tiết &amp; Báo lỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {filteredResults.map((r, idx) => {
                        const isMatch = r.status === 'matched';
                        const isMismatch = r.status === 'amount_mismatch';
                        const isNotFound = r.status === 'not_found';

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isMismatch ? 'bg-amber-50/40' : isNotFound ? 'bg-rose-50/30' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0F172A]">
                              {r.inputCode}
                            </td>

                            <td className="py-2.5 px-3">
                              {r.matchedOrder ? (
                                <div>
                                  <div className="font-semibold text-[#0F172A]">
                                    {r.matchedOrder.customer.name}
                                  </div>
                                  <div className="text-[10px] text-[#64748B]">
                                    {r.matchedOrder.customer.phone}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#94A3B8] italic">-</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                              {formatVND(r.inputAmount)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#475569]">
                              {r.systemAmount !== undefined ? formatVND(r.systemAmount) : '-'}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              {r.diffAmount === 0 ? (
                                <span className="text-emerald-600">0đ</span>
                              ) : r.diffAmount > 0 ? (
                                <span className="text-emerald-700">+{formatVND(r.diffAmount)}</span>
                              ) : (
                                <span className="text-rose-600">{formatVND(r.diffAmount)}</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              {isMatch && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Trùng khớp</span>
                                </span>
                              )}
                              {isMismatch && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5">
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  <span>Lệch số tiền</span>
                                </span>
                              )}
                              {isNotFound && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5">
                                  <XCircle className="h-3 w-3" />
                                  <span>Không tìm thấy</span>
                                </span>
                              )}
                              {r.status === 'invalid_format' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5">
                                  Sai định dạng
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-[11px] text-[#475569]">
                              <span
                                className={
                                  isMismatch
                                    ? 'text-amber-800 font-semibold'
                                    : isNotFound
                                    ? 'text-rose-700 font-medium'
                                    : 'text-emerald-700'
                                }
                              >
                                {r.note}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 bg-[#F8FAFC] flex items-center justify-between text-xs">
          <div className="text-[#64748B]">
            Hệ thống đối soát đơn hàng Achat GO · So sánh tiền thu thực tế vs dữ liệu đơn trên shop
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
