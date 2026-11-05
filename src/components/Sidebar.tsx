import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Radio,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Truck,
  ScanBarcode,
  Facebook,
  Bot,
  UserCog,
  Building,
  Receipt,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'social_chat' // Vchat go Social Channel
  | 'livestream'
  | 'orders'
  | 'products'
  | 'customers'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount: number;
  unreadChatCount: number;
  onOpenBarcodeStockIn: () => void;
  onOpenFanpageConnect: () => void;
  onOpenShippingCarriers?: () => void;
  onOpenStaffManagement?: () => void;
  onOpenAiTraining?: () => void;
  onOpenBranchManagement?: () => void;
  onOpenCodReconciliation?: () => void;
  onOpenHelpCenter?: () => void;
  carrierCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  unreadChatCount,
  onOpenBarcodeStockIn,
  onOpenFanpageConnect,
  onOpenShippingCarriers,
  onOpenStaffManagement,
  onOpenAiTraining,
  onOpenBranchManagement,
  onOpenCodReconciliation,
  onOpenHelpCenter,
  carrierCount = 8,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isProductSubmenuOpen, setIsProductSubmenuOpen] = React.useState(false);
  const [isShippingSubmenuOpen, setIsShippingSubmenuOpen] = React.useState(false);

  const productSubmenuItems = [
    { label: 'Danh sách sản phẩm', action: () => onSelectTab('products') },
    { label: 'Quản lý kho', action: () => onSelectTab('products') },
    { label: 'Đặt hàng nhập', action: () => onOpenBarcodeStockIn() },
    { label: 'Nhập hàng', action: () => onOpenBarcodeStockIn() },
    { label: 'Kiểm hàng', action: () => onOpenBarcodeStockIn() },
    { label: 'Chuyển hàng', action: () => onOpenBranchManagement?.() },
    { label: 'Nhà cung cấp', action: () => onSelectTab('products') },
    { label: 'Điều chỉnh giá vốn', action: () => onSelectTab('products') },
  ];

  const shippingSubmenuItems = [
    { label: 'Tổng quan', action: () => onSelectTab('dashboard') },
    { label: 'Quản lý vận đơn', action: () => onSelectTab('orders') },
    { label: 'Đối soát COD và phí', action: () => onOpenCodReconciliation?.() },
    { label: 'Kết nối đối tác', action: () => onOpenShippingCarriers?.() },
    { label: 'Cấu hình giao hàng', action: () => onOpenShippingCarriers?.() },
  ];

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
    },
    {
      id: 'social_chat' as NavTab,
      label: 'Chốt đơn Fanpage',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? `${unreadChatCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse',
    },
    {
      id: 'livestream' as NavTab,
      label: 'Chốt đơn Live',
      icon: Radio,
    },
    {
      id: 'orders' as NavTab,
      label: 'Đơn hàng',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? `${pendingCount}` : undefined,
      badgeColor: 'bg-[#0088FF] text-white',
    },
    {
      id: 'products' as NavTab,
      label: 'Sản phẩm',
      icon: Package,
      hasSubmenu: true,
    },
    {
      id: 'customers' as NavTab,
      label: 'Khách hàng',
      icon: Users,
    },
    {
      id: 'settings' as NavTab,
      label: 'Cấu hình shop',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-[#1E293B] bg-[#182538] text-white shrink-0 select-none transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div>
        {/* Workspace Brand Lockup & Collapse Arrow Button */}
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-[#24334B]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0088FF] to-[#0055CC] text-white font-black shadow-md">
              A
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200">
                <div className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
                  <span>Achat</span>
                  <span className="rounded bg-[#0088FF]/30 px-1 py-0.2 text-[9px] font-bold text-[#38BDF8]">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] truncate max-w-[120px]">
                  binbinbobo999
                </div>
              </div>
            )}
          </div>

          {/* Toggle Collapse Arrow Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`flex h-7 w-7 items-center justify-center rounded-lg bg-[#203047] text-[#94A3B8] hover:bg-[#0088FF] hover:text-white transition-all cursor-pointer shadow-xs ${
                isCollapsed ? 'mx-auto mt-2' : ''
              }`}
              title={isCollapsed ? 'Mở rộng menu chính' : 'Thu gọn menu để rộng màn hình chốt đơn'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isProductItem = item.id === 'products';

            return (
              <div key={item.id} className="space-y-1">
                <div
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-medium transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-[#0088FF] text-white shadow-xs font-semibold'
                      : 'text-[#94A3B8] hover:bg-[#203047] hover:text-white'
                  }`}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.badgeColor || 'bg-slate-700 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* 3-dot submenu toggle button for Products */}
                      {isProductItem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProductSubmenuOpen((prev) => !prev);
                          }}
                          className={`p-1 rounded-md hover:bg-white/20 transition-colors ${
                            isProductSubmenuOpen ? 'text-white bg-white/10' : 'text-slate-400'
                          }`}
                          title="Menu quản lý sản phẩm"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {item.badge && isCollapsed && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#182538]" />
                  )}

                  {/* Floating tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 hidden group-hover:flex items-center gap-1.5 rounded-md bg-[#0F172A] px-2.5 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50 pointer-events-none">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-rose-500 px-1.5 py-0.2 text-[9px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submenu for Products (Matching Image 1) */}
                {isProductItem && isProductSubmenuOpen && !isCollapsed && (
                  <div className="ml-4 pl-3 py-1 space-y-1 border-l-2 border-[#0088FF]/40 animate-in fade-in duration-150">
                    {productSubmenuItems.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={sub.action}
                        className="w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#CBD5E1] hover:text-white hover:bg-[#203047] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0088FF]" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Vận chuyển Menu Item (Matching Image 2) */}
          <div className="space-y-1">
            <div
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-medium transition-all relative group cursor-pointer text-[#94A3B8] hover:bg-[#203047] hover:text-white`}
              onClick={() => onSelectTab('orders')}
              title={isCollapsed ? 'Vận chuyển' : undefined}
            >
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 shrink-0 text-[#38BDF8]" />
                {!isCollapsed && <span>Vận chuyển</span>}
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[9px] font-bold">
                    {carrierCount} ĐV
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsShippingSubmenuOpen((prev) => !prev);
                    }}
                    className={`p-1 rounded-md hover:bg-white/20 transition-colors ${
                      isShippingSubmenuOpen ? 'text-white bg-white/10' : 'text-slate-400'
                    }`}
                    title="Menu vận chuyển & đối soát"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Submenu for Shipping (Matching Image 2) */}
            </div>

            {isShippingSubmenuOpen && !isCollapsed && (
              <div className="ml-4 pl-3 py-1 space-y-1 border-l-2 border-[#38BDF8]/40 animate-in fade-in duration-150">
                {shippingSubmenuItems.map((sub, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={sub.action}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#CBD5E1] hover:text-white hover:bg-[#203047] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Quick Action Shortcuts */}
        <div className="px-2 pt-2 space-y-1 border-t border-[#24334B]/60 mt-1">
          {!isCollapsed && (
            <div className="px-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Cấu hình & Tích hợp
            </div>
          )}

          <button
            onClick={onOpenBarcodeStockIn}
            title={isCollapsed ? 'Nhập kho Barcode' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
            } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
          >
            <ScanBarcode className="h-4 w-4 shrink-0 text-emerald-400" />
            {!isCollapsed && <span>Nhập kho Barcode</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                Nhập kho Barcode
              </span>
            )}
          </button>

          <button
            onClick={onOpenFanpageConnect}
            title={isCollapsed ? 'Kết nối Fanpage FB' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
            } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
          >
            <Facebook className="h-4 w-4 shrink-0 text-[#1877F2]" />
            {!isCollapsed && <span>Kết nối Fanpage FB</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                Kết nối Fanpage FB
              </span>
            )}
          </button>

          {onOpenShippingCarriers && (
            <button
              onClick={onOpenShippingCarriers}
              title={isCollapsed ? `Đơn vị vận chuyển (${carrierCount})` : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
            >
              <Truck className="h-4 w-4 shrink-0 text-amber-400" />
              {!isCollapsed && <span>ĐV vận chuyển ({carrierCount})</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                  ĐV vận chuyển ({carrierCount})
                </span>
              )}
            </button>
          )}

          {onOpenStaffManagement && (
            <button
              onClick={onOpenStaffManagement}
              title={isCollapsed ? 'Phân quyền nhân viên' : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
            >
              <UserCog className="h-4 w-4 shrink-0 text-purple-400" />
              {!isCollapsed && <span>Phân quyền nhân viên</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                  Phân quyền nhân viên
                </span>
              )}
            </button>
          )}

          {onOpenBranchManagement && (
            <button
              onClick={onOpenBranchManagement}
              title={isCollapsed ? 'Quản lý chi nhánh' : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
            >
              <Building className="h-4 w-4 shrink-0 text-cyan-400" />
              {!isCollapsed && <span>Quản lý chi nhánh</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                  Quản lý chi nhánh
                </span>
              )}
            </button>
          )}

          {onOpenCodReconciliation && (
            <button
              onClick={onOpenCodReconciliation}
              title={isCollapsed ? 'Đối soát tiền / COD' : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
            >
              <Receipt className="h-4 w-4 shrink-0 text-emerald-400" />
              {!isCollapsed && <span>Đối soát tiền / COD</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                  Đối soát tiền / COD
                </span>
              )}
            </button>
          )}

          {onOpenAiTraining && (
            <button
              onClick={onOpenAiTraining}
              title={isCollapsed ? 'Dạy kịch bản AI' : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-1.5'
              } rounded-lg text-xs font-medium text-[#CBD5E1] hover:bg-[#203047] hover:text-white transition-colors cursor-pointer group relative`}
            >
              <Bot className="h-4 w-4 shrink-0 text-indigo-400" />
              {!isCollapsed && <span>Dạy kịch bản AI</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 hidden group-hover:block rounded bg-[#0F172A] px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap z-50">
                  Dạy kịch bản AI
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Status / Help */}
      <div className="p-2 border-t border-[#24334B] space-y-2">
        {!isCollapsed ? (
          <>
            <button
              onClick={onOpenShippingCarriers}
              className="w-full text-left rounded-xl bg-[#203047] p-2.5 text-xs text-[#94A3B8] hover:bg-[#283c58] transition-colors border border-transparent hover:border-[#0088FF]/30 cursor-pointer"
            >
              <div className="flex items-center justify-between text-white font-semibold mb-1">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#0088FF]" />
                  <span>ĐVVC ({carrierCount})</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-normal">● Sẵn sàng</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#94A3B8]">
                GHN, GHTK, Viettel Post, J&T, SPX. Nhấn cấu hình.
              </p>
            </button>

            <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-[#64748B]">
              <span className="font-semibold text-slate-400">Achat v2026</span>
              {onOpenHelpCenter ? (
                <button
                  type="button"
                  onClick={onOpenHelpCenter}
                  className="text-[#0088FF] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span>Trợ giúp</span>
                </button>
              ) : (
                <span className="text-[#0088FF] hover:underline cursor-pointer">Trợ giúp</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={onOpenShippingCarriers}
              title="Đơn vị vận chuyển"
              className="p-2 rounded-lg bg-[#203047] text-[#0088FF] hover:bg-[#283c58] cursor-pointer"
            >
              <Truck className="h-4 w-4" />
            </button>
            {onOpenHelpCenter && (
              <button
                onClick={onOpenHelpCenter}
                title="Trung tâm trợ giúp Achat"
                className="p-2 rounded-lg text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
