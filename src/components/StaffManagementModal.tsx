import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Building,
  KeyRound,
  Check,
  Sparkles,
  UserCheck,
  Sliders,
  Lock,
  Unlock,
  Shield,
  Layers,
  ShoppingBag,
  MessageSquare,
  Package,
} from 'lucide-react';
import { StaffMember, StaffRole, StaffPermissions } from '../types';
import { getDefaultPermissions } from '../utils/formatters';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  currentStaffId: string;
  onSelectCurrentStaff: (staffId: string) => void;
  onAddStaff: (newStaff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onUpdateStaff: (updated: StaffMember) => void;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  staffList,
  currentStaffId,
  onSelectCurrentStaff,
  onAddStaff,
  onDeleteStaff,
  onUpdateStaff,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'staff_list' | 'permission_matrix'>('staff_list');
  const [selectedStaffForPerm, setSelectedStaffForPerm] = useState<string>(currentStaffId || staffList[0]?.id);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('consultant');
  const [branch, setBranch] = useState('Kho Tổng - TP. Hồ Chí Minh');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const ROLE_CONFIG: Record<
    StaffRole,
    { title: string; color: string; badge: string; desc: string }
  > = {
    super_admin: {
      title: 'Quản trị viên cấp cao nhất (Super Admin)',
      color: 'bg-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Quyền hạn cao nhất hệ thống website, phân quyền cho Chủ Shop Admin và toàn bộ nhân viên.',
    },
    admin: {
      title: 'Chủ cửa hàng & Quản trị viên',
      color: 'bg-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Toàn quyền cấu hình shop, tài chính, API Facebook, vận chuyển và phân quyền nhân viên bán hàng/kho.',
    },
    manager: {
      title: 'Trưởng ca tư vấn & Chốt đơn',
      color: 'bg-pink-600',
      badge: 'bg-pink-50 text-pink-700 border-pink-200',
      desc: 'Quản lý hội thoại, duyệt đơn hàng, quản lý kho hàng và theo dõi hiệu suất bán.',
    },
    consultant: {
      title: 'Nhân viên tư vấn trực chat',
      color: 'bg-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Trực tiếp nhắn tin tư vấn, chốt đơn từ chat, gắn nhãn hashtag theo trạng thái đơn.',
    },
    warehouse: {
      title: 'Nhân viên kho & Đóng gói',
      color: 'bg-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Quét mã vạch Barcode nhập kho, đóng gói hàng, in phiếu giao hàng và đẩy shipper.',
    },
    accountant: {
      title: 'Kế toán & Đối soát tiền / COD',
      color: 'bg-teal-600',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      desc: 'Đối soát công nợ shipper, khớp mã đơn và sao kê ngân hàng, báo cáo thuế.',
    },
    custom: {
      title: 'Nhân viên tùy biến linh động',
      color: 'bg-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Tùy chỉnh quyền hạn riêng biệt bằng cách tích chọn từng mục phân quyền.',
    },
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-500', 'bg-amber-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, ''),
      password: password.trim() || '12345678a@A',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@achat.vn`,
      phone: phone.trim() || '0988.000.111',
      role,
      roleTitle: ROLE_CONFIG[role].title,
      branch,
      avatarColor: randomColor,
      avatarInitials: initials || 'NV',
      isOnline: true,
      assignedConversationsCount: 0,
      permissions: getDefaultPermissions(role),
    };

    onAddStaff(newStaff);
    setName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  // Toggle specific permission on selected staff member
  const handleToggleStaffPermission = (staffId: string, permKey: keyof StaffPermissions) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target) return;

    const currentPerms = target.permissions || getDefaultPermissions(target.role);
    const updatedPerms: StaffPermissions = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey],
    };

    onUpdateStaff({
      ...target,
      permissions: updatedPerms,
    });

    setSavedNotice(`Đã cập nhật quyền "${permKey}" cho ${target.name}`);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  // Reset selected staff's permissions to default role permissions
  const handleResetToRoleDefault = (staffId: string) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target) return;

    onUpdateStaff({
      ...target,
      permissions: getDefaultPermissions(target.role),
    });

    setSavedNotice(`Đã khôi phục quyền mặc định vai trò ${ROLE_CONFIG[target.role].title} cho ${target.name}`);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const targetStaff = staffList.find((s) => s.id === selectedStaffForPerm) || staffList[0];
  const targetPermissions = targetStaff?.permissions || getDefaultPermissions(targetStaff?.role || 'consultant');

  // Groups of permissions with clear Vietnamese descriptions
  const PERMISSION_GROUPS = [
    {
      groupName: '1. Quản lý Fanpage & Chăm sóc khách hàng (Chat)',
      icon: MessageSquare,
      color: 'text-[#0088FF]',
      items: [
        {
          key: 'canChat' as keyof StaffPermissions,
          label: 'Nhắn tin & Tư vấn khách hàng',
          desc: 'Cho phép gửi tin nhắn, trả lời bình luận và gửi ảnh sản phẩm cho khách',
        },
        {
          key: 'canCloseOrderInChat' as keyof StaffPermissions,
          label: 'Chốt đơn trực tiếp từ khung chat',
          desc: 'Cho phép mở popup tạo đơn hàng nhanh ngay khi khách chốt mẫu & gửi SĐT',
        },
        {
          key: 'canManageTags' as keyof StaffPermissions,
          label: 'Gán & Xóa nhãn Hashtag',
          desc: 'Gán nhãn phân loại khách hàng (#ĐãChốt, #ĐơnCầnXácNhận, #ĐãLênĐơn,...)',
        },
        {
          key: 'canUseAiReply' as keyof StaffPermissions,
          label: 'Sử dụng AI hỗ trợ chốt đơn',
          desc: 'Cho phép dùng AI Gemini phân tích tin nhắn và gợi ý kịch bản trả lời khách',
        },
        {
          key: 'canConnectPages' as keyof StaffPermissions,
          label: 'Cấp quyền & Kết nối Fanpage Facebook',
          desc: 'Cho phép đăng nhập tài khoản Facebook và thêm bớt Fanpage trong Achat GO',
        },
        {
          key: 'canTrainAi' as keyof StaffPermissions,
          label: 'Dạy kịch bản máy học AI',
          desc: 'Cho phép chỉnh sửa kịch bản tư vấn size, xử lý chê đắt, combo up-sell cho AI',
        },
      ],
    },
    {
      groupName: '2. Quản lý Đơn hàng & Vận chuyển',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      items: [
        {
          key: 'canViewOrders' as keyof StaffPermissions,
          label: 'Xem danh sách đơn hàng',
          desc: 'Cho phép truy cập danh sách toàn bộ đơn hàng của shop',
        },
        {
          key: 'canCreateOrder' as keyof StaffPermissions,
          label: 'Tạo đơn hàng mới thủ công (F1)',
          desc: 'Cho phép lên đơn hàng tại quầy hoặc tạo đơn từ nguồn ngoài',
        },
        {
          key: 'canUpdateOrderStatus' as keyof StaffPermissions,
          label: 'Cập nhật trạng thái đơn hàng',
          desc: 'Duyệt đơn, xác nhận thanh toán, chuyển trạng thái hoàn tất',
        },
        {
          key: 'canPushShipping' as keyof StaffPermissions,
          label: 'Gom đơn & Đẩy sang hãng vận chuyển',
          desc: 'Cho phép đẩy đơn sang GHN, GHTK, Viettel Post, J&T, Best Express lấy mã vận đơn',
        },
        {
          key: 'canPrintInvoice' as keyof StaffPermissions,
          label: 'In phiếu giao hàng (A5/K80/PDF)',
          desc: 'Cho phép in phiếu gửi hàng có mã vạch barcode cho bưu tá',
        },
        {
          key: 'canCancelOrder' as keyof StaffPermissions,
          label: 'Hủy đơn hàng',
          desc: 'Cho phép hủy đơn khi khách từ chối nhận hoặc hết hàng',
        },
      ],
    },
    {
      groupName: '3. Kho hàng & Sản phẩm',
      icon: Package,
      color: 'text-amber-600',
      items: [
        {
          key: 'canViewProducts' as keyof StaffPermissions,
          label: 'Xem danh mục sản phẩm & tồn kho',
          desc: 'Tra cứu số lượng tồn kho từng mẫu, size và màu sắc',
        },
        {
          key: 'canStockInBarcode' as keyof StaffPermissions,
          label: 'Nhập kho bằng mã vạch Barcode',
          desc: 'Quét camera/máy quét để tạo phiếu nhập kho và tăng số lượng tồn kho',
        },
        {
          key: 'canEditProduct' as keyof StaffPermissions,
          label: 'Thêm & Sửa sản phẩm, giá bán',
          desc: 'Khai báo mẫu mới, điều chỉnh giá bán và giá vốn sản phẩm',
        },
      ],
    },
    {
      groupName: '4. Chi nhánh, Tài chính & Hệ thống',
      icon: Building,
      color: 'text-purple-600',
      items: [
        {
          key: 'canManageBranches' as keyof StaffPermissions,
          label: 'Quản lý & Thêm chi nhánh kho mới',
          desc: 'Khai báo chi nhánh mới, điều chuyển chi nhánh làm việc',
        },
        {
          key: 'canManageCarriers' as keyof StaffPermissions,
          label: 'Cấu hình đơn vị vận chuyển & Đối soát tiền',
          desc: 'Nhập API Token/Tài khoản nhà vận chuyển và chạy đối soát tiền COD',
        },
        {
          key: 'canManageStaff' as keyof StaffPermissions,
          label: 'Quản lý tài khoản & Phân quyền nhân viên',
          desc: 'Thêm tài khoản nhân viên mới và cấp quyền truy cập các tính năng',
        },
        {
          key: 'canViewRevenue' as keyof StaffPermissions,
          label: 'Xem báo cáo doanh thu & Lợi nhuận',
          desc: 'Xem biểu đồ doanh thu theo ngày, số dư tiền và giá vốn hàng bán',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Quản lý Nhân viên &amp; Phân quyền chức năng Achat GO
                </h3>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                  {staffList.length} nhân viên
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Phân quyền chi tiết cho nhân viên trong Fanpage chat, Đơn hàng, Kho vận, Vận chuyển và Báo cáo
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

        {/* Tab switchers */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F1F5F9]/60 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('staff_list')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff_list'
                ? 'border-purple-600 text-purple-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Tài khoản nhân viên ({staffList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permission_matrix')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'permission_matrix'
                ? 'border-purple-600 text-purple-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Phân quyền chức năng chi tiết</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {savedNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* Quick active staff switcher bar */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-5 w-5 text-[#0088FF] shrink-0" />
              <div>
                <span className="font-bold text-xs text-[#1E3A8A] block">
                  Nhân viên đang đăng nhập phiên hiện tại:
                </span>
                <span className="text-[11px] text-[#2563EB]">
                  {staffList.find((s) => s.id === currentStaffId)?.name} (
                  {staffList.find((s) => s.id === currentStaffId)?.roleTitle})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={currentStaffId}
                onChange={(e) => onSelectCurrentStaff(e.target.value)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] outline-none shadow-2xs cursor-pointer"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.roleTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================
              TAB 1: STAFF LIST & ADD NEW STAFF
             ======================================================== */}
          {activeTab === 'staff_list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  Danh sách tài khoản nhân viên
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] hover:bg-[#0077E6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isAdding ? 'Đóng form' : 'Thêm nhân viên mới'}</span>
                </button>
              </div>

              {/* Add Form */}
              {isAdding && (
                <form onSubmit={handleCreateStaff} className="rounded-xl border border-[#CBD5E1] p-4 bg-[#F8FAFC] space-y-3">
                  <span className="font-bold text-xs text-[#0F172A] block uppercase tracking-wider">
                    Thêm tài khoản nhân viên mới
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Lê Thảo Linh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Tên đăng nhập *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: thaolinh99"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Mật khẩu ban đầu</label>
                      <input
                        type="text"
                        placeholder="Mặc định: 12345678a@A"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Email đăng nhập</label>
                      <input
                        type="email"
                        placeholder="linh.le@achat.vn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        placeholder="0988.111.222"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Vai trò &amp; Chức danh *</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as StaffRole)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0088FF]"
                      >
                        <option value="admin">Chủ cửa hàng &amp; Quản trị viên (Admin)</option>
                        <option value="manager">Trưởng ca &amp; Quản lý (Manager)</option>
                        <option value="consultant">Nhân viên tư vấn &amp; Bán hàng (Consultant)</option>
                        <option value="warehouse">Nhân viên kho &amp; Đóng gói (Warehouse)</option>
                        <option value="accountant">Kế toán &amp; Đối soát COD (Accountant)</option>
                        <option value="custom">Nhân viên tùy biến linh động (Custom)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-[#334155] block mb-1">Chi nhánh làm việc</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9]"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0088FF] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6]"
                    >
                      Tạo tài khoản &amp; Cấp quyền
                    </button>
                  </div>
                </form>
              )}

              {/* Staff Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {staffList.map((staff) => {
                  const isCurrent = staff.id === currentStaffId;
                  const cfg = ROLE_CONFIG[staff.role] || ROLE_CONFIG.consultant;

                  return (
                    <div
                      key={staff.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isCurrent
                          ? 'border-[#0088FF] bg-blue-50/30 shadow-xs ring-1 ring-[#0088FF]/30'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-xs shadow-xs ${staff.avatarColor}`}
                          >
                            {staff.avatarInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#0F172A]">{staff.name}</span>
                              {isCurrent && (
                                <span className="rounded-full bg-blue-100 text-[#0088FF] text-[10px] font-bold px-2 py-0.2">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-block h-2 w-2 rounded-full ${staff.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span>{staff.isOnline ? 'Đang trực tuyến' : 'Vắng mặt'}</span>
                              <span>·</span>
                              <span>{staff.branch}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${cfg.badge}`}>
                          {staff.role.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#475569] mt-2 italic">{cfg.desc}</p>

                      <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 mt-3 text-[11px]">
                        <span className="text-[#64748B]">{staff.phone}</span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffForPerm(staff.id);
                              setActiveTab('permission_matrix');
                            }}
                            className="text-[#0088FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Phân quyền</span>
                          </button>

                          {staffList.length > 1 && staff.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => onDeleteStaff(staff.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Xóa nhân viên"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: DETAILED PERMISSION MATRIX (Phân quyền chức năng)
             ======================================================== */}
          {activeTab === 'permission_matrix' && (
            <div className="space-y-4">
              {/* Staff Selector for Permission Editing */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-purple-700" />
                  <div>
                    <span className="font-bold text-xs text-purple-950 block">
                      Đang tùy biến quyền cho nhân viên:
                    </span>
                    <span className="text-[11px] text-purple-800">
                      <strong>{targetStaff?.name}</strong> · Vai trò: {ROLE_CONFIG[targetStaff?.role || 'consultant'].title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedStaffForPerm}
                    onChange={(e) => setSelectedStaffForPerm(e.target.value)}
                    className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] outline-none cursor-pointer"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleResetToRoleDefault(targetStaff.id)}
                    className="rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#475569] transition-colors cursor-pointer"
                    title="Khôi phục quyền mặc định theo vai trò"
                  >
                    Mặc định vai trò
                  </button>
                </div>
              </div>

              {/* Permission Groups Checklist */}
              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group, gIdx) => {
                  const Icon = group.icon;
                  return (
                    <div key={gIdx} className="rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-2xs">
                      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${group.color}`} />
                        <span className="font-bold text-xs text-[#0F172A]">{group.groupName}</span>
                      </div>

                      <div className="divide-y divide-[#F1F5F9]">
                        {group.items.map((item) => {
                          const isAllowed = Boolean(targetPermissions[item.key]);

                          return (
                            <label
                              key={item.key}
                              className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isAllowed}
                                onChange={() => handleToggleStaffPermission(targetStaff.id, item.key)}
                                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#0088FF] focus:ring-[#0088FF] cursor-pointer"
                              />

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold text-xs ${isAllowed ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                                    {item.label}
                                  </span>
                                  {isAllowed ? (
                                    <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2">
                                      Được phép
                                    </span>
                                  ) : (
                                    <span className="rounded bg-slate-100 text-slate-500 text-[10px] font-medium px-1.5 py-0.2">
                                      Đã khóa
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 bg-[#F8FAFC] flex items-center justify-between text-xs">
          <div className="text-[#64748B]">
            Hệ thống phân quyền Role-Based Access Control (RBAC) Achat GO v2026
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
