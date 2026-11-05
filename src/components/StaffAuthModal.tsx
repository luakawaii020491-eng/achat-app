import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';
import { StaffMember, StaffRole, Branch } from '../types';
import { getDefaultPermissions } from '../utils/formatters';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  currentStaffId: string;
  onLoginSuccess: (staffId: string) => void;
  onRegisterStaff: (newStaff: StaffMember) => void;
  branches?: Branch[];
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  staffList,
  currentStaffId,
  onLoginSuccess,
  onRegisterStaff,
  branches = [],
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state (Defaults to requested account khuyendv / 12345678a@A)
  const [loginUsername, setLoginUsername] = useState('khuyendv');
  const [loginPassword, setLoginPassword] = useState('12345678a@A');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBranch, setRegBranch] = useState(branches[0]?.name || 'Kho Tổng - TP. Hồ Chí Minh');
  const [regRole, setRegRole] = useState<StaffRole>('consultant');
  const [regError, setRegError] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = staffList.find(
      (s) =>
        (s.username && s.username.toLowerCase() === loginUsername.trim().toLowerCase()) ||
        s.email.toLowerCase() === loginUsername.trim().toLowerCase()
    );

    if (!user) {
      setLoginError('Tài khoản hoặc tên đăng nhập không tồn tại trên hệ thống!');
      return;
    }

    if (user.password && user.password !== loginPassword) {
      setLoginError('Mật khẩu không chính xác! Vui lòng thử lại.');
      return;
    }

    onLoginSuccess(user.id);
    onClose();
  };

  // Quick Switcher (1-click login)
  const handleQuickLogin = (user: StaffMember) => {
    onLoginSuccess(user.id);
    onClose();
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regUsername.trim() || !regPassword) {
      setRegError('Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Check duplicate username
    const exists = staffList.some(
      (s) => s.username?.toLowerCase() === regUsername.trim().toLowerCase()
    );
    if (exists) {
      setRegError('Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.');
      return;
    }

    const initials = regName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .slice(-2)
      .join('')
      .toUpperCase();

    const roleTitles: Record<StaffRole, string> = {
      super_admin: 'Quản trị viên cấp cao nhất',
      admin: 'Chủ shop / Quản trị viên',
      manager: 'Quản lý ca / Chi nhánh',
      consultant: 'Nhân viên tư vấn & chốt đơn',
      warehouse: 'Nhân viên kho vận',
      accountant: 'Kế toán đối soát',
      custom: 'Nhân viên tùy chỉnh',
    };

    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: regName.trim(),
      username: regUsername.trim(),
      password: regPassword,
      email: regEmail.trim() || `${regUsername.trim()}@achat.vn`,
      phone: regPhone.trim() || '0988.000.111',
      role: regRole,
      roleTitle: roleTitles[regRole],
      branch: regBranch,
      avatarColor: 'bg-blue-600',
      avatarInitials: initials,
      isOnline: true,
      canManagePermissions: regRole === 'super_admin' || regRole === 'admin',
      permissions: getDefaultPermissions(regRole),
    };

    onRegisterStaff(newStaffMember);
    onLoginSuccess(newStaffMember.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-900 to-[#182538] text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0088FF] text-white font-extrabold shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Hệ thống phân quyền &amp; Đăng nhập</h2>
              <p className="text-[11px] text-slate-300">Achat GO • Phân quyền đa cấp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers: Đăng nhập vs Đăng ký */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-center">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-[#0088FF] border-b-2 border-[#0088FF]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Đăng nhập tài khoản</span>
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-[#0088FF] border-b-2 border-[#0088FF]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Đăng ký nhân viên mới</span>
          </button>
        </div>

        {/* Mode 1: LOGIN */}
        {mode === 'login' && (
          <div className="p-6 space-y-4 text-xs">
            {loginError && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ví dụ: khuyendv hoặc an.nguyen"
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-[#0088FF] focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-10 py-2 text-xs focus:border-[#0088FF] focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#0088FF] hover:bg-[#0077E6] text-white py-2.5 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập hệ thống</span>
              </button>
            </form>

            {/* Quick 1-click Account Switcher */}
            <div className="pt-3 border-t border-slate-200">
              <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#0088FF]" />
                <span>Hoặc chọn nhanh tài khoản có sẵn:</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {staffList.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleQuickLogin(st)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      st.id === currentStaffId
                        ? 'border-[#0088FF] bg-blue-50/70 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-[11px] font-bold ${st.avatarColor}`}>
                        {st.avatarInitials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {st.role === 'super_admin' && (
                            <span className="rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.2">
                              Super Admin
                            </span>
                          )}
                          {st.role === 'admin' && (
                            <span className="rounded bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.2">
                              Chủ shop
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          user: <span className="font-mono font-semibold text-[#0088FF]">{st.username || st.email.split('@')[0]}</span> • {st.roleTitle}
                        </div>
                      </div>
                    </div>
                    {st.id === currentStaffId && (
                      <CheckCircle2 className="h-4 w-4 text-[#0088FF] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs max-h-[500px] overflow-y-auto">
            {regError && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Họ và tên nhân viên *
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Thị Hoa"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="hoa.nguyen"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0988.xxx.xxx"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nhập lại mật khẩu *
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Khớp mật khẩu trên"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Vai trò công việc
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as StaffRole)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                >
                  <option value="consultant">Tư vấn bán hàng &amp; Chat</option>
                  <option value="warehouse">Kho &amp; Soát đơn</option>
                  <option value="manager">Quản lý chi nhánh</option>
                  <option value="admin">Quản trị viên shop</option>
                  <option value="accountant">Kế toán / Đối soát</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chi nhánh làm việc
                </label>
                <select
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-[#0088FF] focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0088FF] hover:bg-[#0077E6] text-white py-2.5 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Đăng ký &amp; Đăng nhập ngay</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
