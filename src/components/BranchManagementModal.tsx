import React, { useState } from 'react';
import {
  X,
  Building,
  Plus,
  CheckCircle2,
  Phone,
  MapPin,
  User,
  Trash2,
  Edit2,
  Store,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Branch } from '../types';

interface BranchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  activeBranchId: string;
  onSelectActiveBranch: (branchName: string, branchId: string) => void;
  onAddBranch: (newBranch: Branch) => void;
  onUpdateBranch: (updated: Branch) => void;
  onDeleteBranch: (branchId: string) => void;
}

export const BranchManagementModal: React.FC<BranchManagementModalProps> = ({
  isOpen,
  onClose,
  branches,
  activeBranchId,
  onSelectActiveBranch,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
}) => {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setCity('Hà Nội');
    setDistrict('');
    setPhone('');
    setManagerName('');
    setIsDefault(false);
    setFormError(null);
    setIsAdding(false);
    setEditingBranchId(null);
  };

  const handleStartEdit = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address);
    setCity(branch.city || 'Hồ Chí Minh');
    setDistrict(branch.district || '');
    setPhone(branch.phone);
    setManagerName(branch.managerName || '');
    setIsDefault(Boolean(branch.isDefault));
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên chi nhánh / kho');
      return;
    }
    if (!code.trim()) {
      setFormError('Vui lòng nhập mã chi nhánh');
      return;
    }
    if (!address.trim()) {
      setFormError('Vui lòng nhập địa chỉ chi nhánh');
      return;
    }

    if (editingBranchId) {
      const updated: Branch = {
        id: editingBranchId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city,
        district,
        phone: phone.trim() || '0916636785',
        managerName: managerName.trim() || 'Quản lý kho',
        isDefault,
      };
      onUpdateBranch(updated);
    } else {
      const newId = `branch-${Date.now()}`;
      const newBranch: Branch = {
        id: newId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city,
        district,
        phone: phone.trim() || '0916636785',
        managerName: managerName.trim() || 'Quản lý kho',
        isDefault,
      };
      onAddBranch(newBranch);
    }

    resetForm();
  };

  const filteredBranches = branches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.managerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0088FF] text-white shadow-md">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Quản lý chi nhánh &amp; Kho hàng đa kênh
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0088FF]">
                  {branches.length} Chi nhánh
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Thêm chi nhánh mới, phân kho xuất hàng, in địa chỉ kho xuất đơn cho shipper
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

        {/* Action bar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên chi nhánh, mã kho, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
            />
          </div>

          {!isAdding && (
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm chi nhánh mới</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add / Edit Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-[#0088FF]" />
                  <span>{editingBranchId ? 'Chỉnh sửa thông tin chi nhánh' : 'Khai báo chi nhánh / kho hàng mới'}</span>
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-[#64748B] hover:text-[#0F172A]"
                >
                  Đóng form
                </button>
              </div>

              {formError && (
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Tên chi nhánh / Kho hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Kho Long Biên - Hà Nội"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Mã kho chi nhánh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: KHO-HN-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none uppercase font-mono focus:border-[#0088FF]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Địa chỉ chi tiết (Dùng in phiếu gửi hàng &amp; Shipper lấy hàng) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Số nhà, tên đường, ngõ xóm..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Quận Cầu Giấy"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0988.112.233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                    Người quản lý kho chi nhánh
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn Thắng"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#334155]">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#0088FF]"
                  />
                  <span>Đặt làm chi nhánh mặc định của cửa hàng</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0088FF] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6]"
                  >
                    {editingBranchId ? 'Lưu thay đổi' : 'Thêm chi nhánh'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Branches List */}
          <div className="space-y-3">
            {filteredBranches.map((b) => {
              const isActive = b.id === activeBranchId || b.name === activeBranchId;
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'border-[#0088FF] bg-blue-50/40 shadow-xs'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A]">{b.name}</span>
                        <span className="rounded bg-slate-100 font-mono text-[10px] font-bold text-[#475569] px-2 py-0.5">
                          {b.code}
                        </span>
                        {b.isDefault && (
                          <span className="rounded-full bg-blue-100 text-[#0088FF] text-[10px] font-bold px-2 py-0.5">
                            Chi nhánh chính
                          </span>
                        )}
                        {isActive && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Đang làm việc
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span>{b.address}{b.city ? `, ${b.city}` : ''}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{b.phone}</span>
                        </span>
                        {b.managerName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>Quản lý: {b.managerName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => onSelectActiveBranch(b.name, b.id)}
                          className="rounded-lg border border-[#0088FF] bg-white px-3 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          Chọn làm việc
                        </button>
                      ) : (
                        <div className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Chi nhánh hiện tại</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(b)}
                        className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
                        title="Chỉnh sửa chi nhánh"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {branches.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xóa chi nhánh "${b.name}"? Dữ liệu đơn hàng và kho sẽ chuyển về chi nhánh chính còn lại.`)) {
                              if (b.isDefault) {
                                const nextDefault = branches.find((item) => item.id !== b.id);
                                if (nextDefault) {
                                  onUpdateBranch({ ...nextDefault, isDefault: true });
                                }
                              }
                              onDeleteBranch(b.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa chi nhánh này"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Chi nhánh duy nhất</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 bg-[#F8FAFC] flex items-center justify-between text-xs">
          <div className="text-[#64748B]">
            Đang quản lý <strong>{branches.length}</strong> kho hàng trên toàn hệ thống Achat.
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
