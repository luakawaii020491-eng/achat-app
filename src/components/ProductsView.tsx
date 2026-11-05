import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  Layers,
  Check,
  Scale,
  Tag,
  X,
  Sparkles,
  Barcode,
  Image as ImageIcon,
  Upload,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import { Product, ProductVariant, ProductAttribute } from '../types';
import { formatVND } from '../utils/formatters';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onDeleteMultipleProducts?: (productIds: string[]) => void;
  onUpdateProductStock: (productId: string, variantId: string, newStock: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDeleteMultipleProducts,
  onUpdateProductStock,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under_200k' | '200k_500k' | 'above_500k'>('all');

  // Multi-select & Batch Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Modal State (Add or Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Thời trang nữ & Đầm váy');
  const [prodSku, setProdSku] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodImage, setProdImage] = useState<string>('/src/assets/images/achat_prod_dress_1793577664954.jpg');
  const [prodWeight, setProdWeight] = useState<number>(380);
  const [prodBasePrice, setProdBasePrice] = useState<number>(189000);
  const [prodCostPrice, setProdCostPrice] = useState<number>(85000);
  const [prodInitialStock, setProdInitialStock] = useState<number>(50);
  const [prodLength, setProdLength] = useState<number>(25);
  const [prodWidth, setProdWidth] = useState<number>(15);
  const [prodHeight, setProdHeight] = useState<number>(8);

  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Dynamic attributes state
  const [attributes, setAttributes] = useState<Array<{ id: string; name: string; rawValues: string }>>([
    { id: 'attr-color', name: 'Màu sắc', rawValues: 'Đỏ, Đen, Kem' },
    { id: 'attr-size', name: 'Kích cỡ', rawValues: 'S, M, L' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Auto generate realistic EAN-13 barcode with prefix 893 (Vietnam GS1 standard)
  const generateEan13Barcode = () => {
    const random9 = Math.floor(100000000 + Math.random() * 900000000);
    return `893${random9}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Open modal for Adding new product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory(categories[1] || 'Thời trang nữ & Đầm váy');
    const autoSku = `SP-${Math.floor(1000 + Math.random() * 9000)}`;
    setProdSku(autoSku);
    setProdBarcode(generateEan13Barcode());
    setProdImage('/src/assets/images/achat_prod_dress_1793577664954.jpg');
    setProdWeight(350);
    setProdBasePrice(189000);
    setProdCostPrice(85000);
    setProdInitialStock(50);
    setProdLength(25);
    setProdWidth(15);
    setProdHeight(8);
    setAttributes([
      { id: 'attr-color', name: 'Màu sắc', rawValues: 'Đỏ, Đen, Trắng' },
      { id: 'attr-size', name: 'Kích cỡ', rawValues: 'S, M, L' },
    ]);
    setShowModal(true);
  };

  // Open modal for Editing existing product
  const handleOpenEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdSku(p.sku || p.variants[0]?.sku || `SP-${p.id.slice(-4)}`);
    setProdBarcode(p.barcode || p.variants[0]?.barcode || generateEan13Barcode());
    setProdImage(p.image);
    setProdWeight(p.weight || 350);
    setProdBasePrice(p.basePrice);
    setProdCostPrice(p.costPrice || p.variants[0]?.costPrice || Math.round(p.basePrice * 0.45));
    setProdInitialStock(p.totalStock);
    setProdLength(p.length || 25);
    setProdWidth(p.width || 15);
    setProdHeight(p.height || 8);
    setFormVariants(p.variants);

    if (p.attributes && p.attributes.length > 0) {
      setAttributes(
        p.attributes.map((a) => ({
          id: a.id,
          name: a.name,
          rawValues: a.values.join(', '),
        }))
      );
    } else {
      setAttributes([
        { id: 'attr-1', name: 'Màu sắc', rawValues: p.variants.map((v) => v.color).filter(Boolean).slice(0, 3).join(', ') || 'Tiêu chuẩn' },
      ]);
    }
    setShowModal(true);
  };

  // Generate Cartesian product of variants based on attributes
  const generatePreviewVariants = () => {
    const validAttrs = attributes
      .filter((a) => a.name.trim() && a.rawValues.trim())
      .map((a) => ({
        name: a.name.trim(),
        values: a.rawValues
          .split(/[,;\n]+/)
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((a) => a.values.length > 0);

    if (validAttrs.length === 0) {
      return [
        {
          id: `var-${Date.now()}-0`,
          sku: prodSku || 'SP-01',
          barcode: prodBarcode || generateEan13Barcode(),
          color: 'Tiêu chuẩn',
          size: 'Freesize',
          price: prodBasePrice,
          costPrice: prodCostPrice,
          stock: prodInitialStock,
          weight: prodWeight,
          attributes: {},
        },
      ];
    }

    const combinations: Array<Record<string, string>> = validAttrs.reduce<Array<Record<string, string>>>(
      (acc, attr) => {
        if (acc.length === 0) {
          return attr.values.map((val) => ({ [attr.name]: val }));
        }
        const next: Array<Record<string, string>> = [];
        acc.forEach((existing) => {
          attr.values.forEach((val) => {
            next.push({ ...existing, [attr.name]: val });
          });
        });
        return next;
      },
      []
    );

    return combinations.map((combo, idx) => {
      const parts = Object.values(combo);
      const skuSuffix = parts.map((p) => p.replace(/\s+/g, '-').toUpperCase()).join('-');
      const prefix = prodSku || 'SP';

      return {
        id: `var-${Date.now()}-${idx}`,
        sku: `${prefix}-${skuSuffix}`,
        barcode: `8936${Math.floor(10000000 + Math.random() * 90000000)}`,
        color: combo['Màu sắc'] || combo['Màu'] || parts[0] || 'Tiêu chuẩn',
        size: combo['Kích cỡ'] || combo['Kích thước / Size'] || combo['Size'] || parts[1] || 'Freesize',
        price: prodBasePrice,
        costPrice: prodCostPrice,
        stock: Math.round(prodInitialStock / (combinations.length || 1)) || 10,
        weight: prodWeight,
        attributes: combo,
      };
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    const previewVariants = generatePreviewVariants();
    const finalVariants: ProductVariant[] = previewVariants.map((v) => ({
      id: v.id || `var-${Date.now()}-${Math.random()}`,
      sku: v.sku,
      barcode: v.barcode || generateEan13Barcode(),
      color: v.color,
      size: v.size,
      price: Number(prodBasePrice) || 100000,
      costPrice: Number(prodCostPrice) || 50000,
      stock: Number(v.stock) || 10,
      weight: Number(prodWeight) || 350,
      attributes: v.attributes,
    }));

    const totalStock = finalVariants.reduce((sum, v) => sum + v.stock, 0);

    const validAttributes: ProductAttribute[] = attributes
      .filter((a) => a.name.trim() && a.rawValues.trim())
      .map((a) => ({
        id: a.id,
        name: a.name.trim(),
        values: a.rawValues
          .split(/[,;\n]+/)
          .map((v) => v.trim())
          .filter(Boolean),
      }));

    if (editingProductId) {
      const updatedProd: Product = {
        id: editingProductId,
        name: prodName.trim(),
        sku: prodSku.trim(),
        barcode: prodBarcode.trim() || generateEan13Barcode(),
        category: prodCategory,
        image: prodImage,
        weight: prodWeight,
        length: prodLength,
        width: prodWidth,
        height: prodHeight,
        basePrice: prodBasePrice,
        costPrice: prodCostPrice,
        totalStock,
        variants: finalVariants,
        attributes: validAttributes,
      };
      if (onUpdateProduct) {
        onUpdateProduct(updatedProd);
      }
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: prodName.trim(),
        sku: prodSku.trim() || `SP-${Date.now().toString().slice(-4)}`,
        barcode: prodBarcode.trim() || generateEan13Barcode(),
        category: prodCategory,
        image: prodImage,
        weight: prodWeight,
        length: prodLength,
        width: prodWidth,
        height: prodHeight,
        basePrice: prodBasePrice,
        costPrice: prodCostPrice,
        totalStock,
        variants: finalVariants,
        attributes: validAttributes,
      };
      onAddProduct(newProduct);
    }

    setShowModal(false);
  };

  // Filter products
  const filtered = products.filter((p) => {
    // 1. Search by name, SKU, or Barcode
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.variants.some((v) => v.sku.toLowerCase().includes(q)) || p.sku?.toLowerCase().includes(q);
      const matchBarcode = p.variants.some((v) => v.barcode?.toLowerCase().includes(q)) || p.barcode?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBarcode) return false;
    }

    // 2. Category
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    // 3. Stock status
    if (stockFilter === 'in_stock' && p.totalStock <= 0) return false;
    if (stockFilter === 'low_stock' && (p.totalStock <= 0 || p.totalStock > 10)) return false;
    if (stockFilter === 'out_of_stock' && p.totalStock > 0) return false;

    // 4. Price range
    if (priceFilter === 'under_200k' && p.basePrice >= 200000) return false;
    if (priceFilter === '200k_500k' && (p.basePrice < 200000 || p.basePrice > 500000)) return false;
    if (priceFilter === 'above_500k' && p.basePrice <= 500000) return false;

    return true;
  });

  // Select all visible
  const isAllSelected = filtered.length > 0 && filtered.every((p) => selectedProductIds.includes(p.id));
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filtered.map((p) => p.id));
    }
  };

  const handleToggleSelectRow = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Delete handlers
  const handleDeleteSingleProduct = (productId: string, productName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" khỏi hệ thống?`)) {
      if (onDeleteProduct) {
        onDeleteProduct(productId);
      }
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleBatchDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedProductIds.length} sản phẩm đã chọn?`)) {
      if (onDeleteMultipleProducts) {
        onDeleteMultipleProducts(selectedProductIds);
      } else if (onDeleteProduct) {
        selectedProductIds.forEach((id) => onDeleteProduct(id));
      }
      setSelectedProductIds([]);
    }
  };

  // Clear all filters
  const hasActiveFilters = selectedCategory !== 'all' || stockFilter !== 'all' || priceFilter !== 'all' || search.trim() !== '';
  const handleClearAllFilters = () => {
    setSelectedCategory('all');
    setStockFilter('all');
    setPriceFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">
              Quản lý Sản phẩm &amp; Tồn kho
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#0088FF]">
              {products.length} sản phẩm
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Quản lý giá vốn, giá bán, tồn kho ban đầu, tự sinh mã vạch Barcode và phân loại thuộc tính đa kênh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm sản phẩm mới</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL FILTER BAR (Thanh lọc ngang theo yêu cầu) */}
      <div className="rounded-xl border border-[#CBD5E1] bg-white p-3 space-y-2.5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="flex-1 flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs max-w-lg">
            <Search className="h-3.5 w-3.5 text-[#94A3B8] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã SKU, mã vạch Barcode..."
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

          {/* Horizontal Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500">Danh mục:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#334155] outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'Tất cả danh mục' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock status filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500">Tồn kho:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#334155] outline-none cursor-pointer"
              >
                <option value="all">Tất cả tồn kho</option>
                <option value="in_stock">Còn hàng (&gt; 0)</option>
                <option value="low_stock">Sắp hết hàng (1 - 10)</option>
                <option value="out_of_stock">Hết hàng (= 0)</option>
              </select>
            </div>

            {/* Price range filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500">Khoảng giá:</span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#334155] outline-none cursor-pointer"
              >
                <option value="all">Tất cả mức giá</option>
                <option value="under_200k">Dưới 200.000đ</option>
                <option value="200k_500k">200.000đ - 500.000đ</option>
                <option value="above_500k">Trên 500.000đ</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS WITH (X) TO DISMISS (Người dùng yêu cầu có nút x để tắt khỏi trình duyệt khi không cần chọn nữa) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-500">Bộ lọc đang áp dụng:</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-medium text-[#0088FF]">
                <span>Danh mục: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="rounded-full hover:bg-blue-200 p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {stockFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                <span>
                  Tồn: {stockFilter === 'in_stock' ? 'Còn hàng' : stockFilter === 'low_stock' ? 'Sắp hết' : 'Hết hàng'}
                </span>
                <button
                  type="button"
                  onClick={() => setStockFilter('all')}
                  className="rounded-full hover:bg-amber-200 p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {priceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                <span>
                  Giá: {priceFilter === 'under_200k' ? '< 200k' : priceFilter === '200k_500k' ? '200k - 500k' : '> 500k'}
                </span>
                <button
                  type="button"
                  onClick={() => setPriceFilter('all')}
                  className="rounded-full hover:bg-emerald-200 p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {search.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[11px] font-medium text-slate-800">
                <span>Tìm: &quot;{search}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="rounded-full hover:bg-slate-200 p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer ml-1"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* BATCH ACTION BAR (Khi chọn 1 hoặc nhiều sản phẩm) */}
      {selectedProductIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0088FF]">
              Đã chọn {selectedProductIds.length} / {filtered.length} sản phẩm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchDelete}
              className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa {selectedProductIds.length} sản phẩm</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE WITH "CHỌN TẤT CẢ" AND SỬA / XÓA */}
      <div className="overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                {/* CHECKBOX CHỌN TẤT CẢ */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-[#0088FF] focus:ring-[#0088FF] cursor-pointer"
                    title="Chọn tất cả sản phẩm"
                  />
                </th>
                <th className="py-3 px-3">Sản phẩm &amp; Hình ảnh</th>
                <th className="py-3 px-3">Mã SKU / Barcode</th>
                <th className="py-3 px-3">Danh mục</th>
                <th className="py-3 px-3">Giá vốn / Giá bán</th>
                <th className="py-3 px-3 text-center">Tồn kho</th>
                <th className="py-3 px-3">Khối lượng</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                const isExpanded = expandedProductId === prod.id;
                const costPrice = prod.costPrice || prod.variants[0]?.costPrice || Math.round(prod.basePrice * 0.45);
                const sku = prod.sku || prod.variants[0]?.sku || 'SP-DEFAULT';
                const barcode = prod.barcode || prod.variants[0]?.barcode || '893600000000';

                return (
                  <React.Fragment key={prod.id}>
                    <tr className={`hover:bg-[#F8FAFC] transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      {/* Row Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(prod.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0088FF] focus:ring-[#0088FF] cursor-pointer"
                        />
                      </td>

                      {/* Product Name & Image */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-10 w-10 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                          />
                          <div>
                            <div
                              onClick={() => handleOpenEditModal(prod)}
                              className="font-bold text-[#0F172A] hover:text-[#0088FF] cursor-pointer"
                              title="Nhấp để sửa sản phẩm"
                            >
                              {prod.name}
                            </div>
                            <div className="text-[10px] text-[#64748B] flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{prod.variants.length} phân loại</span>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => setExpandedProductId(isExpanded ? null : prod.id)}
                                className="text-[#0088FF] hover:underline font-semibold"
                              >
                                {isExpanded ? 'Ẩn SKU' : 'Xem SKU'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Barcode */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-800">{sku}</div>
                        <div className="text-[#64748B] flex items-center gap-1 text-[10px]">
                          <Barcode className="h-3 w-3 text-slate-400" />
                          <span>{barcode}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                          {prod.category}
                        </span>
                      </td>

                      {/* Cost & Retail Price */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#0088FF]">{formatVND(prod.basePrice)}</div>
                        <div className="text-[10px] text-[#64748B]">Vốn: {formatVND(costPrice)}</div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            prod.totalStock > 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : prod.totalStock > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {prod.totalStock > 0 ? `${prod.totalStock} cái` : 'Hết hàng'}
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-3 text-[#475569]">
                        <div className="flex items-center gap-1 font-semibold">
                          <Scale className="h-3 w-3 text-blue-600" />
                          <span>{prod.weight || 350}g</span>
                        </div>
                      </td>

                      {/* Action Buttons: SỬA, XÓA, XEM CHI TIẾT */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-blue-50 hover:text-[#0088FF] transition-colors cursor-pointer"
                            title="Sửa sản phẩm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleProduct(prod.id, prod.name)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Variants Detail Row */}
                    {isExpanded && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={8} className="p-4 border-t border-b border-[#E2E8F0]">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] uppercase tracking-wider text-[#334155] flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5 text-[#0088FF]" />
                                Chi tiết từng phân loại SKU &amp; Mã vạch ({prod.variants.length} phân loại)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                              {prod.variants.map((v) => (
                                <div
                                  key={v.id}
                                  className="rounded-lg border border-[#E2E8F0] bg-white p-2.5 space-y-1 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-[#0F172A]">
                                      {v.color} - Size {v.size}
                                    </span>
                                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                                      Tồn: {v.stock}
                                    </span>
                                  </div>
                                  <div className="font-mono text-[10px] text-[#64748B] flex items-center justify-between">
                                    <span>SKU: {v.sku}</span>
                                    <span>{v.weight || prod.weight}g</span>
                                  </div>
                                  <div className="font-mono text-[10px] text-[#64748B] flex items-center gap-1">
                                    <Barcode className="h-3 w-3 text-slate-400" />
                                    <span>{v.barcode}</span>
                                  </div>
                                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[11px]">
                                    <span className="font-bold text-[#0088FF]">{formatVND(v.price)}</span>
                                    <span className="text-[10px] text-[#94A3B8]">Vốn: {formatVND(v.costPrice)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THÊM / SỬA SẢN PHẨM VỚI TỒN BAN ĐẦU, GIÁ VỐN, VÀ TỰ SINH MÃ VẠCH HOẶC ĐIỀN CÓ SẴN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {editingProductId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới vào kho'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Khai báo giá vốn, tồn kho ban đầu, tự sinh mã vạch chuẩn hoặc nhập mã vạch có sẵn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đầm hoa nhí xòe cổ V mùa hè"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#0088FF]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Danh mục sản phẩm
                      </label>
                      <input
                        type="text"
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs text-[#0F172A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Mã sản phẩm (SKU)
                      </label>
                      <input
                        type="text"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        placeholder="SP-1001"
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-mono font-bold text-[#0F172A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#334155]">
                    Hình ảnh đại diện
                  </label>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 text-center">
                    <img
                      src={prodImage}
                      alt="Product"
                      className="h-20 w-20 rounded-lg object-cover mb-2 border border-slate-200"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 rounded bg-white border border-[#CBD5E1] px-2 py-1 text-[10px] font-semibold text-[#0088FF] hover:bg-blue-50 cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Đổi ảnh từ máy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TỒN BAN ĐẦU, GIÁ VỐN, GIÁ BÁN & TỰ SINH MÃ VẠCH (YÊU CẦU TRỌNG TÂM CỦA NGƯỜI DÙNG) */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="font-bold text-xs text-[#0088FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="h-4 w-4" />
                    <span>Giá vốn, Tồn kho &amp; Mã vạch Barcode</span>
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Hỗ trợ máy quét mã vạch và kiểm kho tự động
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* TỒN BAN ĐẦU */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Tồn kho ban đầu *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={prodInitialStock}
                      onChange={(e) => setProdInitialStock(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-mono font-bold text-emerald-700 outline-none focus:border-[#0088FF]"
                    />
                  </div>

                  {/* GIÁ VỐN */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Giá vốn (Giá nhập) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={prodCostPrice}
                      onChange={(e) => setProdCostPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#0088FF]"
                    />
                  </div>

                  {/* GIÁ BÁN LẺ */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Giá bán lẻ (đ) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={prodBasePrice}
                      onChange={(e) => setProdBasePrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-mono font-bold text-[#0088FF] outline-none focus:border-[#0088FF]"
                    />
                  </div>

                  {/* CÂN NẶNG */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Cân nặng (gram)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prodWeight}
                      onChange={(e) => setProdWeight(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                {/* MÃ VẠCH (BARCODE) VỚI NÚT TỰ SINH HOẶC NHẬP TAY */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Mã vạch sản phẩm (Barcode)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Barcode className="h-4 w-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Nhập mã vạch có sẵn trên bao bì hoặc nhấn nút tự sinh..."
                        value={prodBarcode}
                        onChange={(e) => setProdBarcode(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-[#0F172A] outline-none focus:border-[#0088FF]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setProdBarcode(generateEan13Barcode())}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-xs cursor-pointer whitespace-nowrap"
                      title="Tự động tạo mã vạch EAN-13 chuẩn Việt Nam (Đầu số 893)"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>⚡ Tự sinh mã vạch</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Mã vạch chuẩn 13 số hỗ trợ quét mã vạch bán hàng tại quầy (POS), kiểm kho, và in tem nhãn dán kiện hàng.
                  </p>
                </div>
              </div>

              {/* DYNAMIC ATTRIBUTES (Màu sắc, Size) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-[#0088FF]" />
                  <span>Thuộc tính phân loại (Màu sắc, Size)</span>
                </span>

                <div className="space-y-2">
                  {attributes.map((attr, index) => (
                    <div key={attr.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div>
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) =>
                            setAttributes((prev) =>
                              prev.map((a, i) => (i === index ? { ...a, name: e.target.value } : a))
                            )
                          }
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
                          placeholder="Tên thuộc tính (Màu sắc, Size)"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={attr.rawValues}
                          onChange={(e) =>
                            setAttributes((prev) =>
                              prev.map((a, i) => (i === index ? { ...a, rawValues: e.target.value } : a))
                            )
                          }
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                          placeholder="Các giá trị cách nhau bằng dấu phẩy (Ví dụ: Đỏ, Vàng, Xanh)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0088FF] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0077E6] transition-colors cursor-pointer"
                >
                  {editingProductId ? 'Lưu thay đổi' : 'Thêm vào kho hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
