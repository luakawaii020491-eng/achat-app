import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Search,
  Facebook,
  Truck,
  Printer,
  ShoppingBag,
  HelpCircle,
  FileText,
  Keyboard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';

export type HelpTab =
  | 'overview'
  | 'facebook'
  | 'carriers'
  | 'order_closing'
  | 'print_pdf'
  | 'shortcuts'
  | 'tax';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HelpTab;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<HelpTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navItems = [
    { id: 'overview' as HelpTab, label: 'Tổng quan Achat', icon: BookOpen },
    { id: 'facebook' as HelpTab, label: 'Kết nối Facebook API', icon: Facebook },
    { id: 'carriers' as HelpTab, label: 'Kết nối Vận chuyển', icon: Truck },
    { id: 'order_closing' as HelpTab, label: 'Chốt đơn & Gom đẩy', icon: ShoppingBag },
    { id: 'print_pdf' as HelpTab, label: 'In đơn & Xuất PDF', icon: Printer },
    { id: 'shortcuts' as HelpTab, label: 'Phím tắt & Mẹo (Alt+?)', icon: Keyboard },
    { id: 'tax' as HelpTab, label: 'Tư vấn Thuế & HKD', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0088FF] text-white shadow-md">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Trung tâm Trợ giúp &amp; Cẩm nang Achat
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0088FF]">
                  Tài liệu chính thức
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Hướng dẫn chi tiết quản lý Fanpage, kết nối API Facebook, đơn vị vận chuyển, in PDF và đối soát
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

        {/* Search Bar */}
        <div className="border-b border-[#E2E8F0] bg-white px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Tìm kiếm hướng dẫn (Ví dụ: cách kết nối FB, lấy mã API vận chuyển, in hóa đơn PDF, phím tắt...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] pl-10 pr-4 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Main Body with Sidebar Navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-56 shrink-0 border-r border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0088FF] text-white shadow-xs font-bold'
                      : 'text-[#475569] hover:bg-[#E2E8F0]/70 hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#E2E8F0] mt-4 px-2 space-y-2">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Hỗ trợ kỹ thuật Achat GO
              </div>
              <div className="text-[11px] text-[#475569] flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-[#0088FF]" />
                <span className="font-semibold">Hotline: 0916636785</span>
              </div>
              <div className="text-[11px] text-[#475569] flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-[#0088FF]" />
                <span>support@achat.vn</span>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-6 text-[#1E293B] space-y-6">
            {/* 1. TỔNG QUAN ACHAT */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#0088FF]" />
                    Chào mừng bạn đến với Achat!
                  </h4>
                  <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                    Achat là hệ thống quản lý bán hàng và chốt đơn đa Fanpage Facebook chuyên nghiệp dành cho shop online, livestreamer và chuỗi cửa hàng bán lẻ.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      <span>1. Quản lý gộp nhiều Fanpage</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Gộp toàn bộ tin nhắn, bình luận từ các Fanpage Facebook vào một màn hình duy nhất. Phân chia hội thoại tự động cho nhân viên tư vấn, tự động gắn nhãn hashtag theo trạng thái đơn.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <ShoppingBag className="h-4 w-4 text-emerald-600" />
                      <span>2. Chốt đơn &amp; Gom đẩy linh hoạt</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Tự do chốt đơn và lưu trữ nội bộ để đóng hàng. Khi cần gửi hàng, có thể gom đơn hàng loạt theo danh mục sản phẩm để đẩy sang hãng vận chuyển chỉ bằng 1 nút bấm.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <Truck className="h-4 w-4 text-amber-600" />
                      <span>3. Kết nối các hãng vận chuyển</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Tích hợp sâu API và tài khoản đăng nhập của GHN, GHTK, Viettel Post, J&amp;T Express, Best Express, VNPost,... Cấp mã vận đơn và in phiếu giao hàng chuẩn bưu tá.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <Printer className="h-4 w-4 text-purple-600" />
                      <span>4. In đơn &amp; Xuất PDF hàng loạt</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Chia lô thông minh (20, 50, 100, 200, 500 đơn) giúp máy in nhiệt và máy in laser A5/K80 chạy mượt mà, không bị treo máy. Xuất file PDF độc lập tải thẳng về máy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HƯỚNG DẪN KẾT NỐI FACEBOOK API */}
            {activeTab === 'facebook' && (
              <div className="space-y-5">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Hướng dẫn kết nối Fanpage Facebook với Achat
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Hỗ trợ cả 2 hình thức: Đăng nhập cấp quyền bằng trình duyệt và Kết nối qua Facebook Graph API Token
                  </p>
                </div>

                {/* Method 1 */}
                <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1877F2]">
                    <Facebook className="h-4 w-4" />
                    <span>Cách 1: Đăng nhập Facebook trên trình duyệt và cấp quyền Fanpage (Khuyên dùng)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-[#475569] leading-relaxed">
                    <li>Mở cửa sổ <strong>"Kết nối Facebook Fanpage"</strong> từ thanh menu hoặc thanh trạng thái trên cùng.</li>
                    <li>Chọn tab <strong>"Từ FB cá nhân cấp quyền"</strong> và nhấn nút <strong>"Đăng nhập tài khoản Facebook &amp; Cấp quyền"</strong>.</li>
                    <li>Trình duyệt sẽ hiển thị danh sách các Fanpage mà tài khoản Facebook của bạn đang nắm quyền quản trị (Admin / Editor).</li>
                    <li>Tích chọn các Fanpage bạn muốn đưa vào Achat (ví dụ: Shop Bé Đan, LÀM ĐẸP 360,...) và nhấn <strong>"Cấp quyền &amp; Thêm vào Achat"</strong>.</li>
                    <li>Achat sẽ tự động đồng bộ tin nhắn, bình luận và cấu hình webhook nhận tin nhắn thời gian thực.</li>
                  </ol>
                </div>

                {/* Method 2 */}
                <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Cách 2: Sử dụng User Access Token hoặc Page Access Token thật từ Meta Developers</span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Dành cho các chủ shop muốn kết nối trực tiếp với Meta Graph API v22.0:
                  </p>
                  <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs space-y-2 font-mono">
                    <div className="text-[11px] text-[#64748B] font-sans">Endpoint đồng bộ Fanpage:</div>
                    <div className="flex items-center justify-between bg-white border border-[#CBD5E1] p-2 rounded">
                      <span>GET https://graph.facebook.com/v22.0/me/accounts</span>
                      <button
                        onClick={() => handleCopy('https://graph.facebook.com/v22.0/me/accounts', 'api-endpoint')}
                        className="text-[#0088FF] text-[11px] flex items-center gap-1 font-sans cursor-pointer"
                      >
                        {copiedKey === 'api-endpoint' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Sao chép</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Chỉ cần dán <strong>User Access Token</strong> vào ô tìm nạp, Achat sẽ tự động gọi API và nạp toàn bộ danh sách Fanpage cùng số lượng người theo dõi của bạn.
                  </p>
                </div>
              </div>
            )}

            {/* 3. KẾT NỐI ĐƠN VỊ VẬN CHUYỂN */}
            {activeTab === 'carriers' && (
              <div className="space-y-5">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Hướng dẫn kết nối Đơn vị Vận chuyển (GHN, GHTK, Viettel Post, J&amp;T, Best Express)
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Hỗ trợ đăng nhập bằng tài khoản chủ shop cung cấp hoặc nhập API Token kết nối trực tiếp
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
                    <span className="font-bold text-xs text-blue-950 block">1. Đăng nhập bằng tài khoản</span>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      Sử dụng Số điện thoại / Tên đăng nhập và Mật khẩu mà bạn dùng để đăng nhập vào App hoặc Website của hãng vận chuyển (ví dụ: khachhang.ghn.vn, khachhang.giaohangtietkiem.vn, jtexpress.vn).
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                    <span className="font-bold text-xs text-emerald-950 block">2. Kết nối qua API Token</span>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Vào phần <strong>Quản lý thông tin tài khoản &gt; Cấu hình API / Token</strong> trên trang web của hãng vận chuyển để sao chép chuỗi mã API Token và dán vào Achat.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-3">
                  <span className="font-bold text-xs text-[#0F172A] block">Danh sách hãng vận chuyển được hỗ trợ:</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#475569]">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                      <span><strong>Giao Hàng Nhanh (GHN):</strong> Token &amp; Shop ID</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                      <span><strong>Giao Hàng Tiết Kiệm (GHTK):</strong> Token &amp; Partner Code</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-600"></span>
                      <span><strong>J&amp;T Express:</strong> Account &amp; Customer Code</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                      <span><strong>Viettel Post:</strong> Username/Pass &amp; Kho hàng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span><strong>Best Express:</strong> Account &amp; Secret Key</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-600"></span>
                      <span><strong>VNPost (Bưu điện VN):</strong> Token API bưu điện</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. CHỐT ĐƠN & GOM ĐẨY VẬN CHUYỂN */}
            {activeTab === 'order_closing' && (
              <div className="space-y-4">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Quy trình Chốt đơn &amp; Gom đẩy vận chuyển linh hoạt
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Không bắt buộc phải đẩy vận chuyển ngay khi chốt đơn! Bạn có thể lưu trữ đơn và gom đẩy theo lô
                  </p>
                </div>

                <div className="space-y-3 text-xs text-[#475569]">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-1.5">
                    <div className="font-bold text-amber-950 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span>Bước 1: Chốt đơn từ Chat hoặc Quầy bán hàng</span>
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      Khi khách hàng gửi SĐT và địa chỉ trên khung chat Fanpage, bấm nút <strong>"Tạo đơn (F1)"</strong> hoặc <strong>"Duyệt &amp; Lên đơn"</strong>. Chọn chế độ <strong>"Chỉ chốt đơn (Lưu đơn thường)"</strong>. Đơn hàng sẽ được chuyển vào trạng thái <em>Đã duyệt / Sẵn sàng đóng gói</em> và chưa đẩy sang hãng vận chuyển.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-1.5">
                    <div className="font-bold text-blue-950 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#0088FF]" />
                      <span>Bước 2: Tổng hợp đơn trong ngày &amp; Gom đẩy theo danh mục</span>
                    </div>
                    <p className="text-blue-900 leading-relaxed">
                      Vào tab <strong>"Đơn hàng"</strong>, chọn bộ lọc <strong>"Chưa đẩy vận chuyển"</strong>. Bạn có thể tích chọn hàng loạt 20, 50, 100 đơn theo từng danh mục sản phẩm (mã nào đã đóng xong thì đẩy, mã nào chưa có thì giữ lại) và nhấn nút <strong>"Gom đẩy ĐVVC"</strong>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1.5">
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Bước 3: Lấy mã vận đơn &amp; In phiếu giao bưu tá</span>
                    </div>
                    <p className="text-emerald-900 leading-relaxed">
                      Hãng vận chuyển sẽ trả về mã vận đơn (Tracking Code) và Mã phân loại bưu cục (Sort Code). Lúc này chỉ cần bấm <strong>"In hóa đơn"</strong> để in phiếu gửi dán lên gói hàng.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. IN ĐƠN & XUẤT FILE PDF */}
            {activeTab === 'print_pdf' && (
              <div className="space-y-4">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Hướng dẫn In đơn hàng loạt &amp; Xuất file định dạng PDF
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Khắc phục hiện tượng chặn popup trên trình duyệt Cốc Cốc / Chrome và in chia lô tối ưu
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                  <div className="font-bold text-xs text-rose-950 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Lý do trình duyệt không hiện cửa sổ in (Vướng mắc thường gặp):</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Các trình duyệt như <strong>Cốc Cốc, Google Chrome, Safari</strong> có tính năng tự động chặn cửa sổ popup (Pop-up Blocker). Khi bấm in, nếu thanh địa chỉ xuất hiện biểu tượng <strong>"Đã chặn cửa sổ bật lên"</strong>, lệnh in sẽ không hiển thị.
                  </p>
                </div>

                <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-3">
                  <div className="font-bold text-xs text-[#0F172A]">Giải pháp được tích hợp sẵn trên Achat:</div>
                  <div className="space-y-2.5 text-xs text-[#475569]">
                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0088FF] font-bold text-[10px]">
                        1
                      </span>
                      <div>
                        <strong>Nút "Tải file PDF / In đơn (.html / .pdf)":</strong> Tải trực tiếp file hóa đơn đã căn chỉnh chuẩn trang in về máy tính của bạn. Bạn có thể mở bằng bất kỳ trình xem PDF nào hoặc trình duyệt để in toàn bộ lô đơn mà không sợ bị chặn popup.
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0088FF] font-bold text-[10px]">
                        2
                      </span>
                      <div>
                        <strong>Chia trang in theo lô (20, 50, 100, 200, 500 đơn):</strong> Giúp máy in nhiệt tem dán (khổ 100x150mm hoặc K80) in liên tục mượt mà, không bị tràn bộ nhớ đệm máy in.
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0088FF] font-bold text-[10px]">
                        3
                      </span>
                      <div>
                        <strong>Cho phép cửa sổ bật lên:</strong> Nhấp vào biểu tượng ổ khóa bên trái thanh địa chỉ trình duyệt Cốc Cốc &gt; Cài đặt trang web &gt; Cho phép <em>"Cửa sổ bật lên và liên kết chuyển hướng"</em>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PHÍM TẮT & MẸO NHANH */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Bảng phím tắt &amp; Mẹo thao tác nhanh trên Achat (Alt+?)
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Tăng 300% tốc độ chốt đơn và phản hồi khách hàng trong giờ cao điểm livestream
                  </p>
                </div>

                <div className="rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-bold">
                      <tr>
                        <th className="py-2.5 px-4 w-40">Phím tắt</th>
                        <th className="py-2.5 px-4">Chức năng</th>
                        <th className="py-2.5 px-4">Mô tả chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      <tr>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0088FF]">F1</td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">Tạo đơn hàng mới</td>
                        <td className="py-2.5 px-4 text-[#64748B]">Mở nhanh form tạo đơn hàng từ khung chat</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0088FF]">F3</td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">Tìm kiếm hội thoại</td>
                        <td className="py-2.5 px-4 text-[#64748B]">Tìm nhanh khách hàng theo tên, số điện thoại hoặc tin nhắn</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0088FF]">F6</td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">Ghi chú khách hàng</td>
                        <td className="py-2.5 px-4 text-[#64748B]">Mở ô ghi chú nội bộ về đặc điểm khách, lịch sử bom hàng</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0088FF]">F7 / F8</td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">Sửa &amp; Lưu địa chỉ</td>
                        <td className="py-2.5 px-4 text-[#64748B]">Áp dụng nhanh địa chỉ giao hàng được AI trích xuất tự động</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0088FF]">Ctrl + K</td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">Tìm kiếm toàn hệ thống</td>
                        <td className="py-2.5 px-4 text-[#64748B]">Tra cứu toàn bộ đơn hàng, sản phẩm tồn kho, mã khách hàng</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0088FF]">/ hoặc #</td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A]">Gợi ý câu trả lời mẫu</td>
                        <td className="py-2.5 px-4 text-[#64748B]">Gõ / hoặc # trong ô chat để chọn kịch bản chào hỏi, giá sỉ, phí ship</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. TƯ VẤN THUẾ & HỘ KINH DOANH */}
            {activeTab === 'tax' && (
              <div className="space-y-4">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Tư vấn Thuế &amp; Kê khai Doanh thu Hộ kinh doanh Online
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Theo quy định mới của Tổng cục Thuế và Bộ Tài chính về thương mại điện tử và bán hàng mạng xã hội
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-2">
                    <span className="font-bold text-[#0F172A] block">1. Ngưỡng doanh thu chịu thuế GTGT &amp; TNCN:</span>
                    <p className="text-[#64748B] leading-relaxed">
                      Cá nhân và Hộ kinh doanh có doanh thu bán lẻ hàng hóa trên <strong>100 triệu đồng/năm</strong> thuộc diện nộp thuế GTGT (1%) và thuế TNCN (0.5%), tổng mức thuế suất là <strong>1.5% trên doanh thu</strong>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#CBD5E1] p-4 bg-white space-y-2">
                    <span className="font-bold text-[#0F172A] block">2. Lưu trữ chứng từ đối soát COD:</span>
                    <p className="text-[#64748B] leading-relaxed">
                      Mọi khoản tiền COD nhận từ các đơn vị vận chuyển (GHN, GHTK, Viettel Post, J&amp;T) chuyển về tài khoản ngân hàng cần được khớp đúng với mã đơn hàng trên hệ thống Achat để phục vụ công tác thanh kiểm tra thuế định kỳ.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2 text-xs">
                  <div className="font-bold text-blue-950 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0088FF]" />
                    <span>Hỗ trợ xuất hóa đơn điện tử tự động trên Achat:</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Achat tích hợp sẵn công cụ xuất dữ liệu doanh thu chi tiết theo ngày/tháng và tương thích với các giải pháp Hóa đơn điện tử khởi tạo từ máy tính tiền (VNPT-Invoice, S-Invoice, MISA meInvoice, BKAV eHoadon).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 bg-[#F8FAFC] flex items-center justify-between text-xs">
          <div className="text-[#64748B]">
            Hệ thống trợ giúp &amp; Cẩm nang vận hành Achat v2026 · Hotline hỗ trợ: <strong>0916636785</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Đã hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
