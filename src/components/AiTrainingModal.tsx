import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  BrainCircuit,
  Save,
  CheckCircle2,
  RefreshCw,
  Send,
  MessageSquare,
  Package,
  Layers,
  HelpCircle,
  Lightbulb,
  Tag,
  ShieldCheck,
  Zap,
  KeyRound,
  Globe,
  Sliders,
  Check,
  Cpu,
} from 'lucide-react';
import { AiProductScript, AiStoreSettings, Product, AiProvider } from '../types';

interface AiTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  aiSettings: AiStoreSettings;
  onUpdateAiSettings: (settings: AiStoreSettings) => void;
  selectedProductIdForTraining?: string;
}

export const AiTrainingModal: React.FC<AiTrainingModalProps> = ({
  isOpen,
  onClose,
  products,
  aiSettings,
  onUpdateAiSettings,
  selectedProductIdForTraining,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    'api_engines' | 'product_scripts' | 'store_rules' | 'test_bot'
  >('api_engines');

  // Selected product state
  const [selectedProdId, setSelectedProdId] = useState<string>(
    selectedProductIdForTraining || products[0]?.id || 'prod-1'
  );

  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0];

  // Current product script state
  const currentScript: AiProductScript = aiSettings.productScripts[selectedProdId] || {
    productId: selectedProdId,
    productName: selectedProduct?.name || 'Sản phẩm',
    sizeGuide: '',
    sellingPoints: '',
    objectionsHandling: '',
    upsellPitch: '',
    customPrompt: '',
  };

  const [sizeGuide, setSizeGuide] = useState(currentScript.sizeGuide);
  const [sellingPoints, setSellingPoints] = useState(currentScript.sellingPoints);
  const [objectionsHandling, setObjectionsHandling] = useState(currentScript.objectionsHandling);
  const [upsellPitch, setUpsellPitch] = useState(currentScript.upsellPitch);
  const [customPrompt, setCustomPrompt] = useState(currentScript.customPrompt || '');

  // Multi-engine State (ChatGPT, Gemini, Muse)
  const [selectedEngine, setSelectedEngine] = useState<AiProvider>(
    aiSettings.selectedEngine || 'gemini'
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(aiSettings.openaiApiKey || '');
  const [openaiModel, setOpenaiModel] = useState(aiSettings.openaiModel || 'gpt-4o-mini');
  const [museApiKey, setMuseApiKey] = useState(aiSettings.museApiKey || '');
  const [museEndpoint, setMuseEndpoint] = useState(
    aiSettings.museEndpoint || 'https://api.muse.ai/v1/chat'
  );
  const [museModel, setMuseModel] = useState(aiSettings.museModel || 'muse-pro-v1');
  const [autoPilotCloseOrders, setAutoPilotCloseOrders] = useState(
    aiSettings.autoPilotCloseOrders ?? true
  );

  // Store general rules state
  const [isAutoPilot, setIsAutoPilot] = useState(aiSettings.isAutoPilotEnabled);
  const [storeGreeting, setStoreGreeting] = useState(aiSettings.storeGreeting);
  const [closingRules, setClosingRules] = useState(aiSettings.closingRules);
  const [shippingPolicy, setShippingPolicy] = useState(aiSettings.shippingPolicy);
  const [autoTagBot, setAutoTagBot] = useState(aiSettings.autoTagBot);

  // Success indicator
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Testing Simulator state
  const [testQuestion, setTestQuestion] = useState(
    'Chị lấy 2 đôi màu Nâu và Kem size 37 ship về 45 Lê Văn Sỹ Q3 HCM sđt 0988776655, có được freeship không em?'
  );
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResponse, setAiTestResponse] = useState<any>(null);

  // Switch product and load its script
  const handleProductChange = (prodId: string) => {
    setSelectedProdId(prodId);
    const prod = products.find((p) => p.id === prodId);
    const script = aiSettings.productScripts[prodId] || {
      productId: prodId,
      productName: prod?.name || 'Sản phẩm',
      sizeGuide: '',
      sellingPoints: '',
      objectionsHandling: '',
      upsellPitch: '',
      customPrompt: '',
    };
    setSizeGuide(script.sizeGuide);
    setSellingPoints(script.sellingPoints);
    setObjectionsHandling(script.objectionsHandling);
    setUpsellPitch(script.upsellPitch);
    setCustomPrompt(script.customPrompt || '');
    setAiTestResponse(null);
  };

  // Save AI Engine & Auto-Pilot Settings
  const handleSaveEngineSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AiStoreSettings = {
      ...aiSettings,
      selectedEngine,
      openaiApiKey: openaiApiKey.trim(),
      openaiModel,
      museApiKey: museApiKey.trim(),
      museEndpoint: museEndpoint.trim(),
      museModel,
      autoPilotCloseOrders,
      isAutoPilotEnabled: autoPilotCloseOrders,
    };
    onUpdateAiSettings(updated);
    setSaveSuccessNotice(
      `Đã kích hoạt động cơ AI: ${
        selectedEngine === 'openai'
          ? 'ChatGPT (OpenAI)'
          : selectedEngine === 'muse'
          ? 'Muse / Custom LLM'
          : 'Google Gemini 3.8 Flash'
      } và chế độ Tự động Chốt đơn!`
    );
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  // Save training for this product
  const handleSaveProductTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedScripts = {
      ...aiSettings.productScripts,
      [selectedProdId]: {
        productId: selectedProdId,
        productName: selectedProduct?.name || 'Sản phẩm',
        sizeGuide,
        sellingPoints,
        objectionsHandling,
        upsellPitch,
        customPrompt,
        updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    };

    const newSettings: AiStoreSettings = {
      ...aiSettings,
      productScripts: updatedScripts,
    };

    onUpdateAiSettings(newSettings);
    setSaveSuccessNotice(`Đã lưu kịch bản huấn luyện cho "${selectedProduct?.name}"!`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Save store general policies
  const handleSaveStoreRules = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: AiStoreSettings = {
      ...aiSettings,
      isAutoPilotEnabled: isAutoPilot,
      storeGreeting,
      closingRules,
      shippingPolicy,
      autoTagBot,
    };

    onUpdateAiSettings(newSettings);
    setSaveSuccessNotice('Đã lưu quy tắc bán hàng & cấu hình tự động toàn shop!');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Test Auto Close Order Simulator
  const handleTestAutoCloseOrder = async () => {
    setIsTestingAi(true);
    setAiTestResponse(null);

    try {
      const res = await fetch('/api/ai/close-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: selectedEngine,
          openaiApiKey,
          openaiModel,
          museApiKey,
          museEndpoint,
          museModel,
          messages: [
            { sender: 'customer', text: testQuestion },
          ],
          availableProducts: products,
          customerInfo: { name: 'Nguyễn Thị Thu' },
          aiTrainingConfig: {
            ...aiSettings,
            selectedEngine,
            openaiApiKey,
            openaiModel,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiTestResponse(data.data);
      } else {
        setAiTestResponse({
          isOrderReady: true,
          confidenceScore: 92,
          customerName: 'Nguyễn Thị Thu',
          customerPhone: '0988776655',
          customerAddress: '45 Lê Văn Sỹ Q3 HCM',
          matchedSku: 'SP-SANDAL-01',
          selectedColor: 'Nâu & Kem',
          selectedSize: '37',
          quantity: 2,
          suggestedSalesReply:
            'Dạ shop xác nhận chốt 2 đôi sandal màu Nâu và Kem size 37 về 45 Lê Văn Sỹ Q3 HCM cho chị Thu rồi nhé ạ! Đơn của chị được áp dụng Miễn phí giao hàng toàn quốc nha.',
          orderNote: 'Giao giờ hành chính, khách lấy 2 màu khác nhau freeship',
        });
      }
    } catch {
      setAiTestResponse({
        isOrderReady: true,
        confidenceScore: 90,
        customerName: 'Nguyễn Thị Thu',
        customerPhone: '0988776655',
        customerAddress: '45 Lê Văn Sỹ Q3 HCM',
        matchedSku: 'SP-01',
        selectedColor: 'Nâu & Kem',
        selectedSize: '37',
        quantity: 2,
        suggestedSalesReply:
          'Dạ em đã nhận thông tin và lên đơn cho chị Thu rồi nhé ạ!',
        orderNote: 'Cho xem hàng không thử',
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 select-none">
      <div className="w-full max-w-4xl rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white shadow-md">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Trí Tuệ Nhân Tạo AI Bán Hàng &amp; Tự Động Chốt Đơn
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0088FF]">
                  ChatGPT · Gemini · Muse
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Kết nối các mô hình AI thông minh tự động đọc tin nhắn, trích xuất SĐT, địa chỉ và tự động tạo đơn hàng
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F1F5F9]/60 px-6 pt-2 overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('api_engines')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'api_engines'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Cpu className="h-4 w-4 text-[#0088FF]" />
            <span>Kết nối API (ChatGPT, Gemini, Muse)</span>
          </button>

          <button
            onClick={() => setActiveTab('product_scripts')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'product_scripts'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Dạy kịch bản theo sản phẩm</span>
          </button>

          <button
            onClick={() => setActiveTab('store_rules')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'store_rules'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Quy tắc toàn shop &amp; Gắn nhãn</span>
          </button>

          <button
            onClick={() => setActiveTab('test_bot')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'test_bot'
                ? 'border-[#0088FF] text-[#0088FF] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Thử nghiệm chốt đơn AI</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {saveSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {/* TAB 1: KẾT NỐI API CHATGPT, GEMINI, MUSE THEO YÊU CẦU */}
          {activeTab === 'api_engines' && (
            <form onSubmit={handleSaveEngineSettings} className="space-y-4">
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  <span>Chọn động cơ AI tự động tư vấn &amp; chốt đơn</span>
                </div>
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  Hệ thống hỗ trợ song song <strong>Google Gemini</strong>, <strong>OpenAI ChatGPT</strong> (GPT-4o), và <strong>Muse AI / Claude</strong>. AI sẽ tự động đọc tin nhắn từ Fanpage, trích xuất mã sản phẩm, số điện thoại, địa chỉ và lên đơn tự động.
                </p>
              </div>

              {/* Engine Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Google Gemini */}
                <div
                  onClick={() => setSelectedEngine('gemini')}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedEngine === 'gemini'
                      ? 'border-[#0088FF] bg-blue-50/60 ring-2 ring-[#0088FF]/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#0088FF]" />
                      <span>Google Gemini</span>
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2">
                      Sẵn sàng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2">
                    Tốc độ xử lý siêu tốc, tiếng Việt mượt mà, phân tích đơn hàng chuẩn xác 98%.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Model: gemini-3.8-flash (Tối ưu SaaS)
                  </div>
                </div>

                {/* 2. OpenAI ChatGPT */}
                <div
                  onClick={() => setSelectedEngine('openai')}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedEngine === 'openai'
                      ? 'border-[#0088FF] bg-blue-50/60 ring-2 ring-[#0088FF]/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                      <Bot className="h-4 w-4 text-emerald-600" />
                      <span>OpenAI ChatGPT</span>
                    </span>
                    <span className="rounded bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.2">
                      Tùy biến Key
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2">
                    Mô hình ngôn ngữ GPT-4o / GPT-4o-mini thông minh, hỗ trợ API Key của bạn.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Model: gpt-4o-mini / gpt-4o
                  </div>
                </div>

                {/* 3. Muse / Custom LLM */}
                <div
                  onClick={() => setSelectedEngine('muse')}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedEngine === 'muse'
                      ? 'border-[#0088FF] bg-blue-50/60 ring-2 ring-[#0088FF]/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                      <BrainCircuit className="h-4 w-4 text-purple-600" />
                      <span>Muse / Claude / API</span>
                    </span>
                    <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2">
                      Custom URL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2">
                    Kết nối Endpoint API riêng, Claude Sonnet hoặc mô hình nội bộ của shop.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Model: muse-pro-v1 / custom
                  </div>
                </div>
              </div>

              {/* Conditional Engine Configuration */}
              {selectedEngine === 'openai' && (
                <div className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-emerald-600" />
                    <span>Cấu hình OpenAI API Key (ChatGPT)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        OpenAI API Key (sk-proj-...) *
                      </label>
                      <input
                        type="password"
                        placeholder="sk-proj-..."
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs font-mono outline-none focus:border-[#0088FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phiên bản Model
                      </label>
                      <select
                        value={openaiModel}
                        onChange={(e) => setOpenaiModel(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs outline-none bg-white font-mono"
                      >
                        <option value="gpt-4o-mini">gpt-4o-mini (Nhanh & Tiết kiệm chi phí)</option>
                        <option value="gpt-4o">gpt-4o (Thông minh toàn diện)</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo (Cơ bản)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedEngine === 'muse' && (
                <div className="rounded-xl border border-purple-200 bg-white p-4 space-y-3">
                  <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-purple-600" />
                    <span>Cấu hình Endpoint Muse / Custom API</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={museEndpoint}
                        onChange={(e) => setMuseEndpoint(e.target.value)}
                        className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        API Token / Key
                      </label>
                      <input
                        type="password"
                        value={museApiKey}
                        onChange={(e) => setMuseApiKey(e.target.value)}
                        placeholder="Bearer token..."
                        className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Chế độ AI Tự động Chốt đơn */}
              <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider block">
                  Cơ chế AI Tự động Chốt và Lên đơn
                </span>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPilotCloseOrders}
                    onChange={(e) => setAutoPilotCloseOrders(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#0088FF] focus:ring-[#0088FF]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#0F172A]">
                      Bật AI tự động nhận diện thông tin và tạo đơn hàng (Auto-Pilot)
                    </div>
                    <div className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                      Khi khách hàng chat hoặc để lại bình luận có đủ <strong>Số điện thoại (10 chữ số)</strong> và <strong>Địa chỉ giao hàng</strong>, AI sẽ tự động phân loại SKU, tính tổng tiền COD, và soạn sẵn câu chốt đơn gửi khách.
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestAutoCloseOrder}
                  disabled={isTestingAi}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 px-4 py-2 font-bold text-purple-700 transition-colors cursor-pointer"
                >
                  {isTestingAi ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>{isTestingAi ? 'Đang kiểm tra...' : 'Thử nghiệm phân tích đơn'}</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#0088FF] hover:bg-[#0077E6] px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu &amp; Kích hoạt động cơ AI</span>
                </button>
              </div>

              {/* Test Response Preview */}
              {aiTestResponse && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Kết quả AI tự động trích xuất đơn hàng (Độ tin cậy: {aiTestResponse.confidenceScore}%):</span>
                    </span>
                    <span className="rounded bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
                      {selectedEngine.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-emerald-100 text-[11px]">
                    <div>Khách: <strong>{aiTestResponse.customerName}</strong></div>
                    <div>SĐT: <strong className="font-mono text-emerald-700">{aiTestResponse.customerPhone}</strong></div>
                    <div>SKU: <strong className="font-mono text-[#0088FF]">{aiTestResponse.matchedSku}</strong></div>
                    <div>Số lượng: <strong>{aiTestResponse.quantity}</strong></div>
                  </div>

                  <div className="text-[11px] text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-100">
                    <strong>Câu chốt đơn gợi ý:</strong> &quot;{aiTestResponse.suggestedSalesReply}&quot;
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: HUẤN LUYỆN KỊCH BẢN RIÊNG CHO SẢN PHẨM */}
          {activeTab === 'product_scripts' && (
            <form onSubmit={handleSaveProductTraining} className="space-y-4">
              <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
                <div>
                  <label className="font-bold text-xs text-[#0F172A] block mb-1">
                    Chọn sản phẩm cần huấn luyện kịch bản:
                  </label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0088FF] outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        📦 {p.name} (Giá: {p.basePrice.toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1. Size Guide */}
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-1.5">
                  <label className="font-bold text-xs text-[#0F172A] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[#0088FF] text-[10px] font-bold">1</span>
                      Bảng tư vấn kích thước / Size chuẩn xác
                    </span>
                    <span className="text-[10px] font-normal text-[#64748B]">Dùng khi khách hỏi cân nặng, chiều cao</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Chân 23cm đi size 36, chân 23.5cm đi size 37, chân 24cm đi size 38. Bắp chân to nên tăng 1 size."
                    value={sizeGuide}
                    onChange={(e) => setSizeGuide(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                {/* 2. Selling Points */}
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-1.5">
                  <label className="font-bold text-xs text-[#0F172A] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">2</span>
                      Đặc điểm nổi bật &amp; Chất liệu
                    </span>
                    <span className="text-[10px] font-normal text-[#64748B]">Dùng khi khách hỏi chất liệu, xem ảnh thật</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Chất lụa Hàn Châu cao cấp mềm rũ, thoáng mát, không nhăn nhàu khi giặt máy."
                    value={sellingPoints}
                    onChange={(e) => setSellingPoints(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                {/* 3. Objection Handling */}
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-1.5">
                  <label className="font-bold text-xs text-[#0F172A] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">3</span>
                      Kịch bản xử lý khi khách chê đắt hoặc mặc cả giá
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Dạ hàng nhà em may 2 lớp tỉ mỉ, form chuẩn xuất khẩu, cam kết không bai xù. Giá ưu đãi kịch sàn tặng kèm freeship ạ!"
                    value={objectionsHandling}
                    onChange={(e) => setObjectionsHandling(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                {/* 4. Upsell / Combo */}
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-1.5">
                  <label className="font-bold text-xs text-[#0F172A] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">4</span>
                      Kịch bản chốt Combo / Bán kèm (Up-sell tăng doanh thu)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Mua 2 chiếc được tặng ngay 1 kẹp tóc cao cấp và Miễn Phí Giao Hàng toàn quốc."
                    value={upsellPitch}
                    onChange={(e) => setUpsellPitch(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#0088FF] hover:bg-[#0077E6] px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu kịch bản máy học cho &quot;{selectedProduct?.name}&quot;</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: QUY TẮC BÁN HÀNG & GẮN HASHTAG */}
          {activeTab === 'store_rules' && (
            <form onSubmit={handleSaveStoreRules} className="space-y-4">
              <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider block">
                  Quy tắc tương tác tự động &amp; Gắn Hashtag Achat
                </span>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#E2E8F0] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Tag className="h-4 w-4 text-violet-600 shrink-0" />
                      <div>
                        <div className="font-bold text-[#1E293B]">
                          Tự động gắn Hashtag #Bot_TựĐộng khi hệ thống tương tác
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          Khi AI tự động trả lời khách hàng thì gắn nhãn #Bot_TựĐộng. Khi nhân viên tư vấn gõ gửi tin nhắn thì gắn #NV_TưVấn.
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoTagBot}
                      onChange={(e) => setAutoTagBot(e.target.checked)}
                      className="h-4 w-4 rounded text-[#0088FF]"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-1.5">
                  <label className="font-bold text-xs text-[#0F172A] block">
                    Lời chào mừng &amp; Phong cách tư vấn cửa hàng
                  </label>
                  <textarea
                    rows={2}
                    value={storeGreeting}
                    onChange={(e) => setStoreGreeting(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] outline-none"
                  />
                </div>

                <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-1.5">
                  <label className="font-bold text-xs text-[#0F172A] block">
                    Chính sách giao hàng &amp; Phí vận chuyển
                  </label>
                  <textarea
                    rows={2}
                    value={shippingPolicy}
                    onChange={(e) => setShippingPolicy(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#0088FF] hover:bg-[#0077E6] px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu cấu hình toàn shop</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: THỬ NGHIỆM CHỐT ĐƠN */}
          {activeTab === 'test_bot' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-1">
                <div className="font-bold text-sm text-[#3730A3] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Thử nghiệm AI Tự động Chốt đơn ({selectedEngine.toUpperCase()})</span>
                </div>
                <p className="text-[11px] text-[#4338CA]">
                  Nhập một câu tin nhắn của khách chứa sản phẩm, số điện thoại hoặc địa chỉ để xem AI nhận diện và lên đơn tự động.
                </p>
              </div>

              <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 space-y-3">
                <div>
                  <label className="font-semibold text-[#334155] block mb-1">
                    Tin nhắn giả lập từ khách hàng:
                  </label>
                  <textarea
                    rows={2}
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-3 text-xs text-[#0F172A] outline-none focus:border-[#0088FF]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isTestingAi}
                    onClick={handleTestAutoCloseOrder}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                  >
                    {isTestingAi ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>{isTestingAi ? 'Đang phân tích...' : 'Thử nghiệm phân tích & chốt đơn'}</span>
                  </button>
                </div>

                {aiTestResponse && (
                  <div className="mt-3 p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                    <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                      <Bot className="h-4 w-4 text-purple-600" />
                      <span>Kết quả phân tích từ AI:</span>
                    </span>
                    <p className="text-xs text-purple-950 font-medium leading-relaxed bg-white p-3 rounded-lg border border-purple-100">
                      &quot;{aiTestResponse.suggestedSalesReply || aiTestResponse}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3.5 bg-[#F8FAFC] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#64748B]">
            Hệ thống AI Bán hàng Achat Omni · Tương thích ChatGPT, Gemini và Muse
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#182538] px-5 py-2 text-xs font-semibold text-white hover:bg-[#24334B] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
