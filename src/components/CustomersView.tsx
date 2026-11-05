import React, { useState } from 'react';
import {
  Search,
  Plus,
  UserCheck,
  ShieldAlert,
  Phone,
  MapPin,
  ShoppingBag,
  Clock,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  User,
  AlertTriangle,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Customer } from '../types';
import { formatVND } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
  onDeleteMultipleCustomers?: (customerIds: string[]) => void;
  onSelectCustomerForOrder: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onDeleteMultipleCustomers,
  onSelectCustomerForOrder,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'loyal' | 'warning'>('all');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Modal State (Add or Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Phường 1');
  const [district, setDistrict] = useState('Quận 1');
  const [city, setCity] = useState('Hà Nội');
  const [isBoomWarning, setIsBoomWarning] = useState(false);
  const [notes, setNotes] = useState('');

  // Filter customers
  const filtered = customers.filter((c) => {
    if (filterType === 'loyal' && c.completedOrders < 3) return false;
    if (filterType === 'warning' && !c.isBoomWarning && c.returnedOrders === 0) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchAddress = c.address?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchAddress) return false;
    }
    return true;
  });

  // Select all logic
  const isAllSelected = filtered.length > 0 && filtered.every((c) => selectedCustomerIds.includes(c.id));
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filtered.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingCustomerId(null);
    setName('');
    setPhone('');
    setAddress('');
    setWard('Phường Bến Nghé');
    setDistrict('Quận 1');
    setCity('TP. Hồ Chí Minh');
    setIsBoomWarning(false);
    setNotes('');
    setShowModal(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomerId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address);
    setWard(c.ward || 'Phường 1');
    setDistrict(c.district || 'Quận Trung tâm');
    setCity(c.city || 'Hà Nội');
    setIsBoomWarning(Boolean(c.isBoomWarning));
    setNotes(c.notes || '');
    setShowModal(true);
  };

  // Save Customer (Add or Update)
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại khách hàng');
      return;
    }

    if (editingCustomerId) {
      const existing = customers.find((c) => c.id === editingCustomerId);
      const updated: Customer = {
        ...existing!,
        id: editingCustomerId,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || 'Chưa có địa chỉ',
        ward: ward.trim(),
        district: district.trim(),
        city: city.trim(),
        isBoomWarning,
        notes: notes.trim(),
      };
      if (onUpdateCustomer) {
        onUpdateCustomer(updated);
      }
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || 'Chưa có địa chỉ',
        ward: ward.trim(),
        district: district.trim(),
        city: city.trim(),
        totalOrders: 0,
        completedOrders: 0,
        returnedOrders: 0,
        totalSpent: 0,
        isBoomWarning,
        notes: notes.trim(),
      };
      onAddCustomer(newCust);
    }

    setShowModal(false);
  };

  // Delete customer
  const handleDeleteCustomer = (id: string, custName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa khách hàng "${custName}"?`)) {
      if (onDeleteCustomer) {
        onDeleteCustomer(id);
      }
      setSelectedCustomerIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedCustomerIds.length === 0) return;
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedCustomerIds.length} khách hàng đã chọn?`)) {
      if (onDeleteMultipleCustomers) {
        onDeleteMultipleCustomers(selectedCustomerIds);
      } else if (onDeleteCustomer) {
        selectedCustomerIds.forEach((id) => onDeleteCustomer(id));
      }
      setSelectedCustomerIds([]);
    }
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">
              Quản lý Khách hàng &amp; CRM Bán lẻ
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#0088FF]">
              {customers.length} khách hàng
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Lịch sử giao nhận, tổng chi tiêu và tính năng cảnh báo bom hàng livestream của hệ thống Achat.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm khách hàng mới</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#CBD5E1] bg-white p-3 shadow-2xs">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="flex flex-1 items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs">
            <Search className="h-3.5 w-3.5 text-[#94A3B8] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo số điện thoại (09...), tên khách hoặc địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-[#0F172A]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex rounded-lg border border-[#CBD5E1] bg-white p-0.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0088FF] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('loyal')}
              className={`rounded px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterType === 'loyal'
                  ? 'bg-[#0088FF] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Khách quen
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className={`rounded px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterType === 'warning'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-rose-600'
              }`}
            >
              ⚠️ Cảnh báo bom
            </button>
          </div>
        </div>

        <div className="text-xs text-[#64748B] font-semibold">
          Đang hiển thị <strong>{filtered.length}</strong> khách hàng
        </div>
      </div>

      {/* Batch action toolbar */}
      {selectedCustomerIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs animate-fadeIn">
          <span className="font-bold text-[#0088FF]">
            Đã chọn {selectedCustomerIds.length} / {filtered.length} khách hàng
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchDelete}
              className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-700 shadow-2xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa đã chọn</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCustomerIds([])}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="rounded-xl border border-[#CBD5E1] bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                {/* SELECT ALL CHECKBOX */}
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-[#0088FF] focus:ring-[#0088FF] cursor-pointer"
                  />
                </th>
                <th className="p-3">Khách hàng</th>
                <th className="p-3">Số điện thoại</th>
                <th className="p-3">Địa chỉ giao hàng</th>
                <th className="p-3 text-center">Đơn thành công</th>
                <th className="p-3 text-center">Chuyển hoàn</th>
                <th className="p-3 text-right">Tổng chi tiêu</th>
                <th className="p-3 text-center">Uy tín</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((c) => {
                const isSelected = selectedCustomerIds.includes(c.id);
                return (
                  <tr key={c.id} className={`hover:bg-[#F8FAFC] transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    {/* Row checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(c.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#0088FF] focus:ring-[#0088FF] cursor-pointer"
                      />
                    </td>

                    {/* Customer Name */}
                    <td className="p-3">
                      <div className="font-bold text-[#0F172A]">{c.name}</div>
                      <div className="text-[10px] text-[#64748B]">Mã: {c.id}</div>
                    </td>

                    {/* Phone */}
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {c.phone}
                    </td>

                    {/* Address */}
                    <td className="p-3 max-w-xs truncate text-[#475569]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                        <span className="truncate">{c.address}{c.city ? `, ${c.city}` : ''}</span>
                      </div>
                    </td>

                    {/* Completed */}
                    <td className="p-3 text-center font-bold text-emerald-700">
                      {c.completedOrders} đơn
                    </td>

                    {/* Returned */}
                    <td className="p-3 text-center font-bold text-rose-600">
                      {c.returnedOrders > 0 ? `${c.returnedOrders} đơn` : '-'}
                    </td>

                    {/* Total spent */}
                    <td className="p-3 text-right font-bold text-[#0088FF]">
                      {formatVND(c.totalSpent)}
                    </td>

                    {/* Reputation / Warning */}
                    <td className="p-3 text-center">
                      {c.isBoomWarning || c.returnedOrders >= 2 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Bom ({c.returnedOrders})</span>
                        </span>
                      ) : c.completedOrders >= 3 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <UserCheck className="h-3 w-3" />
                          <span>Khách quen</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          <span>Bình thường</span>
                        </span>
                      )}
                    </td>

                    {/* Action buttons: SỬA, XÓA, LÊN ĐƠN */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectCustomerForOrder(c)}
                          className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] font-bold text-[#0088FF] hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Lên đơn cho khách này"
                        >
                          Lên đơn
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-blue-50 hover:text-[#0088FF] transition-colors cursor-pointer"
                          title="Sửa thông tin khách hàng"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa khách hàng"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA KHÁCH HÀNG */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {editingCustomerId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Quản lý thông tin liên hệ, địa chỉ giao hàng và cảnh báo bom hàng
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0088FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0988776655"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-mono font-bold text-[#0F172A] outline-none focus:border-[#0088FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Địa chỉ chi tiết (Số nhà, đường)
                </label>
                <input
                  type="text"
                  placeholder="Số 45 Lê Văn Sỹ..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-1">Tỉnh/TP</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-1">Phường/Xã</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
              </div>

              {/* Boom warning toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-rose-200 bg-rose-50/60">
                  <input
                    type="checkbox"
                    checked={isBoomWarning}
                    onChange={(e) => setIsBoomWarning(e.target.checked)}
                    className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-900 block">Cảnh báo rủi ro bom hàng / Boom warning</span>
                    <span className="text-[10px] text-rose-700">Đánh dấu khách từng hủy ngang, không nhận hàng livestream</span>
                  </div>
                </label>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ghi chú nội bộ về khách
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú sở thích, size quen thuộc, dặn dò đóng gói..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0088FF] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#0077E6] cursor-pointer"
                >
                  {editingCustomerId ? 'Lưu thay đổi' : 'Thêm khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
