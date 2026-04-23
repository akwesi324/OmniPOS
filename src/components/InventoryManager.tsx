import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  Truck, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  TrendingDown,
  ChevronRight,
  MoreVertical,
  X,
  Minus,
  Check,
  Mail,
  Send,
  Loader2,
  BarChart3,
  Calendar,
  Zap,
  Star,
  History
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

type SubTab = 'products' | 'suppliers' | 'orders' | 'reports';

interface POItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  supplierEmail?: string;
  date: string;
  status: string;
  total: number;
  items: POItem[];
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  cat: string;
  address?: string;
}

export default function InventoryManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPOId, setEditingPOId] = useState<string | null>(null);
  
  // Product management states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', sku: '', cat: 'Drinks', price: 0, stock: 0, threshold: 0, dailyVelocity: 0
  });

  // Supplier details states
  const [selectedSupplierState, setSelectedSupplierState] = useState<Supplier | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({});

  // Filtering states
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | 'pending' | 'received'>('all');
  const [productSearch, setProductSearch] = useState('');
  
  // Real-time Holiday Discounts
  const [activeHoliday, setActiveHoliday] = useState<{name: string, discount: number} | null>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  
  // Email states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'generating' | 'sending' | 'success' | 'error'>('idle');
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' });

  // States for new PO
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<POItem[]>([]);

  const [products, setProducts] = useState([
    { id: '1', name: 'Coca Cola 500ml', sku: 'SODA-001', cat: 'Drinks', price: 12.0, stock: 45, threshold: 20, dailyVelocity: 5.2 },
    { id: '2', name: 'Milo 400g Tray', sku: 'BEV-042', cat: 'Groceries', price: 85.5, stock: 8, threshold: 15, dailyVelocity: 2.1 },
    { id: '3', name: 'A4 Paper (Ream)', sku: 'STAT-11', cat: 'Stationery', price: 45.0, stock: 120, threshold: 30, dailyVelocity: 1.5 },
    { id: '4', name: 'Apple MacBook Air', sku: 'ELEC-99', cat: 'Electronics', price: 15000.0, stock: 2, threshold: 5, dailyVelocity: 0.1 },
    { id: '5', name: 'Hand Sanitizer 1L', sku: 'HLTH-05', cat: 'Health', price: 25.0, stock: 15, threshold: 25, dailyVelocity: 4.8 },
  ]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 's1', name: 'Coca-Cola Bottling Ltd', contact: 'Kofi Manu', phone: '+233 24 000 1111', email: 'orders@coke.gh', cat: 'Beverages', address: 'Plot 24, Industrial Area, North Ridge, Accra' },
    { id: 's2', name: 'Nestle Ghana', contact: 'Ama Serwaa', phone: '+233 50 222 3333', email: 'sales@nestle.gh', cat: 'Groceries', address: 'Motorway Extension, Tema Industrial Estate, Tema' },
    { id: 's3', name: 'Kingdom Books', contact: 'Yaw Boateng', phone: '+233 27 444 5555', email: 'biz@kingdom.com', cat: 'Stationery', address: 'Osu Crescent, behind Danquah Circle, Osu, Accra' },
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    { 
      id: 'PO-8821', 
      supplier: 'Nestle Ghana', 
      supplierEmail: 'sales@nestle.gh',
      date: '2026-04-18', 
      status: 'received', 
      total: 4200,
      items: [
        { productId: '2', name: 'Milo 400g Tray', quantity: 50, costPrice: 84.0 }
      ]
    },
    { 
      id: 'PO-8822', 
      supplier: 'Coca-Cola Bottling Ltd', 
      supplierEmail: 'orders@coke.gh',
      date: '2026-04-19', 
      status: 'pending', 
      total: 1200,
      items: [
        { productId: '1', name: 'Coca Cola 500ml', quantity: 100, costPrice: 12.0 }
      ]
    }
  ]);

  // Performance Calculations
  const supplierPerformance = useMemo(() => {
    return suppliers.map(s => {
      const sOrders = purchaseOrders.filter(o => o.supplier === s.name);
      const totalSpend = sOrders.reduce((sum, o) => sum + o.total, 0);
      const receivedCount = sOrders.filter(o => o.status === 'received').length;
      const reliability = sOrders.length > 0 ? (receivedCount / sOrders.length) * 100 : 0;
      
      return {
        ...s,
        totalSpend,
        orderCount: sOrders.length,
        reliability: reliability.toFixed(1)
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [suppliers, purchaseOrders]);

  // Real-time Pricing Logic
  const discountedProducts = useMemo(() => {
    return products.map(p => {
      const discount = activeHoliday ? activeHoliday.discount : 0;
      return {
        ...p,
        originalPrice: p.price,
        currentPrice: p.price * (1 - discount / 100)
      };
    });
  }, [products, activeHoliday]);
  
  // Order History Sorting
  const sortedPurchaseOrders = useMemo(() => {
    return [...purchaseOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchaseOrders]);

  const addToOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setOrderItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        costPrice: product.price * 0.7 // Assuming 30% margin for simulation
      }];
    });
  };

  const handleCreatePO = () => {
    if (!selectedSupplierId || orderItems.length === 0) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const total = orderItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    
    if (editingPOId) {
      setPurchaseOrders(prev => prev.map(o => o.id === editingPOId ? {
        ...o,
        supplier: supplier?.name || o.supplier,
        supplierEmail: supplier?.email || o.supplierEmail,
        total: total,
        items: orderItems
      } : o));
      setEditingPOId(null);
    } else {
      const newPO: PurchaseOrder = {
        id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier: supplier?.name || 'Unknown',
        supplierEmail: supplier?.email || 'vendor@example.com',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        total: total,
        items: orderItems
      };
      setPurchaseOrders([newPO, ...purchaseOrders]);
    }
    
    setIsModalOpen(false);
    setOrderItems([]);
    setSelectedSupplierId('');
    setActiveSubTab('orders');
  };

  const handleEditPO = (po: PurchaseOrder) => {
    if (po.status === 'received') return;
    setEditingPOId(po.id);
    const supplier = suppliers.find(s => s.name === po.supplier);
    setSelectedSupplierId(supplier?.id || '');
    setOrderItems(po.items);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    if (editingProductId) {
      setProducts(prev => prev.map(p => p.id === editingProductId ? { 
        ...productForm, 
        id: p.id,
        // Calculate dailyVelocity if not provided or keep it
        dailyVelocity: productForm.dailyVelocity || p.dailyVelocity
      } : p));
    } else {
      const newProduct = {
        ...productForm,
        id: (products.length + 1).toString(),
      };
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setProductForm({ name: '', sku: '', cat: 'Drinks', price: 0, stock: 0, threshold: 0, dailyVelocity: 0.1 });
  };

  const handleEditProduct = (p: any) => {
    setEditingProductId(p.id);
    setProductForm({ ...p });
    setIsProductModalOpen(true);
  };

  const handleEditSupplier = (s: Supplier) => {
    setSupplierForm({ ...s });
    setIsEditingSupplier(true);
  };

  const handleSaveSupplier = () => {
    if (!supplierForm.id) return;
    const updatedSuppliers = suppliers.map(s => s.id === supplierForm.id ? supplierForm as Supplier : s);
    setSuppliers(updatedSuppliers);
    setSelectedSupplierState(supplierForm as Supplier);
    setIsEditingSupplier(false);
  };

  const generateEmailPreview = async (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsEmailModalOpen(true);
    setEmailStatus('generating');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a professional procurement officer at OmniPOS system, a modern retail point-of-sale system. 
      Generate a professional, formal purchase order email to our supplier, ${po.supplier}.
      
      Order Details:
      Reference: ${po.id}
      Date: ${po.date}
      Total Value: GHS ${po.total.toFixed(2)}
      
      Products:
      ${po.items.map(item => `- ${item.name}: ${item.quantity} units @ GHS ${item.costPrice.toFixed(2)} each`).join('\n')}
      
      The email should be concise, polite, and professional. 
      Return the result in JSON format with 'subject' and 'body' fields.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text);
      setGeneratedEmail({
        subject: data.subject || `Purchase Order ${po.id} - OmniPOS system`,
        body: data.body || `Dear ${po.supplier} Team,\n\nPlease find attached the purchase order ${po.id}.\n\nBest regards.`
      });
      setEmailStatus('idle');
    } catch (error) {
      console.error("Gemini failed:", error);
      setGeneratedEmail({
        subject: `Purchase Order ${po.id} - OmniPOS system`,
        body: `Dear ${po.supplier} Team,\n\nPlease process our Purchase Order ${po.id} for a total of GHS ${po.total.toFixed(2)}.\n\nBest regards,\nProcurement Team`
      });
      setEmailStatus('idle');
    }
  };

  const sendEmailAction = async () => {
    if (!selectedPO) return;
    setEmailStatus('sending');
    
    try {
      const response = await fetch('/api/orders/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedPO.id,
          supplierEmail: selectedPO.supplierEmail,
          subject: generatedEmail.subject,
          body: generatedEmail.body
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setEmailStatus('success');
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailStatus('idle');
        }, 2000);
      } else {
        setEmailStatus('error');
      }
    } catch (error) {
      setEmailStatus('error');
    }
  };

  const handleReceiveOrder = (poId: string) => {
    const po = purchaseOrders.find(o => o.id === poId);
    if (!po || po.status === 'received') return;

    // 1. Update Product Stock
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const orderedItem = po.items.find(item => item.productId === product.id);
        if (orderedItem) {
          return {
            ...product,
            stock: product.stock + orderedItem.quantity
          };
        }
        return product;
      });
    });

    // 2. Update PO Status
    setPurchaseOrders(prevOrders => {
      return prevOrders.map(order => 
        order.id === poId ? { ...order, status: 'received' } : order
      );
    });
  };

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.threshold), [products]);

  return (
    <div className="space-y-8 pb-20 relative">
      {/* PO Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingPOId ? 'Edit Purchase Order' : 'Create Purchase Order'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Stock Replenishment Service</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
                {/* Selection Area */}
                <div className="flex-1 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Select Target Supplier</label>
                    <div className="grid grid-cols-1 gap-3">
                      {suppliers.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => setSelectedSupplierId(s.id)}
                          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            selectedSupplierId === s.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                              {s.name[0]}
                            </div>
                            <span className={`text-sm font-bold ${selectedSupplierId === s.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                              {s.name}
                            </span>
                          </div>
                          {selectedSupplierId === s.id && <Check size={18} className="text-blue-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Add Products to Order</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                      {products.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => addToOrder(p.id)}
                          className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-800 transition-all flex items-center gap-3 text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 transition-colors">
                            <Plus size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{p.stock} In Stock</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary / Items Preview */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col bg-slate-100/50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Order Items Preview</h4>
                  
                  <div className="flex-1 space-y-4 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {orderItems.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                         <Package size={24} className="opacity-20" />
                         <p className="text-[10px] font-bold">No Items Selected</p>
                      </div>
                    ) : (
                      orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-white dark:border-slate-800">
                           <div className="flex-1 min-w-0">
                             <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                             <p className="text-[9px] font-mono text-slate-500 mt-0.5">{item.quantity} x GHS {item.costPrice.toFixed(2)}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setOrderItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => setOrderItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                              >
                                <Plus size={14} />
                              </button>
                           </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cost</span>
                       <span className="text-xl font-black text-blue-600">GHS {orderItems.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <button 
                      disabled={!selectedSupplierId || orderItems.length === 0}
                      onClick={handleCreatePO}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 dark:shadow-none hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                      {editingPOId ? 'Update Purchase Order' : 'Issue Purchase Order'}
                    </button>
                    {editingPOId && (
                      <button 
                        onClick={() => {
                          setEditingPOId(null);
                          setOrderItems([]);
                          setSelectedSupplierId('');
                          setIsModalOpen(false);
                        }}
                        className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Discard Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEmailStatus('idle') === 'idle' && setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <Mail size={20} />
                   </div>
                   <div>
                      <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Email Purchase Order</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPO?.id} • {selectedPO?.supplier}</p>
                   </div>
                </div>
                <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {emailStatus === 'generating' ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 text-slate-400">
                    <Loader2 size={48} className="animate-spin text-blue-600" />
                    <p className="text-xs font-black uppercase tracking-widest">Generating Professional Email...</p>
                  </div>
                ) : emailStatus === 'sending' ? (
                   <div className="h-64 flex flex-col items-center justify-center space-y-4 text-slate-400">
                    <Loader2 size={48} className="animate-spin text-blue-600" />
                    <p className="text-xs font-black uppercase tracking-widest">Transmitting to Supplier Server...</p>
                  </div>
                ) : emailStatus === 'success' ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Check size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Email Sent Successfully!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient</label>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                        {selectedPO?.supplierEmail}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                      <input 
                        type="text" 
                        value={generatedEmail.subject}
                        onChange={(e) => setGeneratedEmail(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                      <textarea 
                        rows={8}
                        value={generatedEmail.body}
                        onChange={(e) => setGeneratedEmail(prev => ({ ...prev, body: e.target.value }))}
                        className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none custom-scrollbar"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  disabled={emailStatus !== 'idle'}
                  onClick={sendEmailAction}
                  className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={14} /> Send Email
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Inventory Control</p>
                </div>
                <button onClick={() => setIsProductModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Product Name</label>
                    <input 
                      type="text" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">SKU Code</label>
                    <input 
                      type="text" 
                      value={productForm.sku}
                      onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Category</label>
                    <select 
                      value={productForm.cat}
                      onChange={(e) => setProductForm({...productForm, cat: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <option>Drinks</option>
                      <option>Groceries</option>
                      <option>Stationery</option>
                      <option>Electronics</option>
                      <option>Health</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Retail Price</label>
                    <input 
                      type="number" 
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Stock</label>
                    <input 
                      type="number" 
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Threshold</label>
                    <input 
                      type="number" 
                      value={productForm.threshold}
                      onChange={(e) => setProductForm({...productForm, threshold: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Velocity</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={productForm.dailyVelocity}
                      onChange={(e) => setProductForm({...productForm, dailyVelocity: parseFloat(e.target.value)})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProduct}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  {editingProductId ? 'Update Item' : 'Add to Catalog'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Supplier Modal */}
      <AnimatePresence>
        {isSupplierModalOpen && selectedSupplierState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupplierModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row divide-x divide-slate-100 dark:divide-slate-800">
                <div className="p-10 flex-1 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black">
                        {selectedSupplierState.name[0]}
                      </div>
                      <div>
                        {isEditingSupplier ? (
                          <input 
                            value={supplierForm.name}
                            onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                            className="text-xl font-black bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedSupplierState.name}</h3>
                        )}
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{selectedSupplierState.cat} Specialist</p>
                      </div>
                    </div>
                    {!isEditingSupplier && (
                      <button 
                        onClick={() => handleEditSupplier(selectedSupplierState)}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Plus size={18} className="rotate-45" /> {/* Using Plus rotated as placeholder for an edit-like icon or just MoreVertical */}
                        {/* Actually let's use MoreVertical or just a label */}
                        <span className="text-[10px] font-black uppercase tracking-widest ml-1">Edit</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-1 transition-colors hover:ring-1 hover:ring-blue-500/30">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</p>
                      {isEditingSupplier ? (
                        <input 
                          value={supplierForm.contact}
                          onChange={(e) => setSupplierForm({...supplierForm, contact: e.target.value})}
                          className="text-sm font-bold bg-white dark:bg-slate-700 border-none rounded-lg p-1 w-full outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSupplierState.contact}</p>
                      )}
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-1 transition-colors hover:ring-1 hover:ring-blue-500/30">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                      {isEditingSupplier ? (
                        <input 
                          value={supplierForm.phone}
                          onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                          className="text-sm font-bold bg-white dark:bg-slate-700 border-none rounded-lg p-1 w-full outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSupplierState.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 space-y-1 transition-colors hover:ring-1 hover:ring-blue-500/30">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Official Email</p>
                    {isEditingSupplier ? (
                        <input 
                          value={supplierForm.email}
                          onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                          className="text-sm font-bold bg-white dark:bg-blue-700/50 border-none rounded-lg p-1 w-full outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{selectedSupplierState.email}</p>
                      )}
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-1 transition-colors hover:ring-1 hover:ring-blue-500/30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Address</p>
                    {isEditingSupplier ? (
                        <textarea 
                          value={supplierForm.address}
                          onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                          rows={2}
                          className="text-sm font-bold bg-white dark:bg-slate-700 border-none rounded-lg p-1 w-full outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{selectedSupplierState.address || 'Not Provided'}</p>
                      )}
                  </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-10 w-full md:w-72 space-y-6 flex flex-col">
                   <div className="flex-1 space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</h4>
                      <div className="space-y-4">
                          {purchaseOrders.filter(o => o.supplier === selectedSupplierState.name).slice(0, 3).map((po, idx) => (
                            <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{po.id}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1">GHS {po.total.toLocaleString()} • {po.status}</p>
                            </div>
                          ))}
                          {purchaseOrders.filter(o => o.supplier === selectedSupplierState.name).length === 0 && (
                            <div className="text-center py-10 opacity-20 flex flex-col items-center text-slate-400">
                              <FileText size={40} className="mb-2" />
                              <p className="text-[10px] font-black uppercase">No History</p>
                            </div>
                          )}
                      </div>
                   </div>

                   <div className="space-y-3">
                      {isEditingSupplier ? (
                        <>
                          <button 
                            onClick={handleSaveSupplier}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Check size={14} /> Save Portal
                          </button>
                          <button 
                            onClick={() => setIsEditingSupplier(false)}
                            className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all"
                          >
                            Cancel Changes
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setIsSupplierModalOpen(false)}
                          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] transition-all"
                        >
                          Close Portal
                        </button>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Holiday Discount Modal */}
      <AnimatePresence>
        {isHolidayModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHolidayModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
            >
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600">
                    <Zap size={28} />
                  </div>
                  <button onClick={() => setIsHolidayModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Activate Sale</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Define the holiday name and global percentage discount.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Independence Day"
                      id="holidayName"
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percent Discount (%)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15"
                      id="holidayDiscount"
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const name = (document.getElementById('holidayName') as HTMLInputElement).value;
                    const discount = parseInt((document.getElementById('holidayDiscount') as HTMLInputElement).value);
                    if (name && !isNaN(discount)) {
                      setActiveHoliday({ name, discount });
                      setIsHolidayModalOpen(false);
                    }
                  }}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Apply Global Pricing Logic
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Supply Chain & Stock</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Monitoring {products.length} catalog items across {suppliers.length} core vendors</p>
        </div>
        
        {/* Sub-navigation Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 transition-colors">
          {[
            { id: 'products', name: 'Inventory', icon: Package },
            { id: 'suppliers', name: 'Suppliers', icon: Truck },
            { id: 'orders', name: 'Order History', icon: History },
            { id: 'reports', name: 'Reports', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Alerts Strip */}
      {lowStockItems.length > 0 && activeSubTab === 'products' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-4 text-red-700 dark:text-red-400">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Low Stock Alert</p>
              <p className="text-xs font-medium">{lowStockItems.length} items have dropped below their critical threshold.</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
            Generate PO
          </button>
        </motion.div>
      )}

      {/* Dynamic Content Rendering */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'products' && (
          <motion.div 
            key="products"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Search & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Catalog Value</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">GHS 84,250</p>
               </div>
               <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                      type="text" 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Filter by SKU, Name or Category..." 
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white h-12 pl-12 pr-4 rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({ name: '', sku: '', cat: 'Drinks', price: 0, stock: 0, threshold: 0, dailyVelocity: 0.1 });
                      setIsProductModalOpen(true);
                    }}
                    className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                  >
                    <Plus size={20} />
                  </button>
               </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.15em]">
                            <tr>
                                <th className="px-8 py-5">Product Info</th>
                                <th className="px-8 py-5 text-center">Velocity (D)</th>
                                <th className="px-8 py-5 text-right">Stock Level</th>
                                <th className="px-8 py-5 text-center">Reorder Point</th>
                                <th className="px-8 py-5 text-center">Suggested PO</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {discountedProducts
                              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                          p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                                          p.cat.toLowerCase().includes(productSearch.toLowerCase())
                              )
                              .map((p, i) => {
                                const isLow = p.stock <= p.threshold;
                                // Reorder point = velocity * 7 (weekly lead time) + threshold
                                const reorderPoint = Math.ceil(p.dailyVelocity * 7 + p.threshold);
                                const suggestedPO = Math.max(0, reorderPoint - p.stock);

                                return (
                                    <tr key={i} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${isLow ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 font-black relative overflow-hidden transition-colors">
                                                    {p.name[0]}
                                                    {isLow && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-slate-100 dark:border-slate-800 rounded-full" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                       <p className="font-bold text-slate-900 dark:text-white leading-tight transition-colors">{p.name}</p>
                                                       {activeHoliday && (
                                                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-tighter">
                                                             <Zap size={8} /> sale
                                                          </div>
                                                       )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">{p.sku} • {p.cat}</p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                       {activeHoliday ? (
                                                          <>
                                                             <span className="text-[10px] line-through text-slate-400 font-bold">GHS {p.originalPrice.toFixed(2)}</span>
                                                             <span className="text-[11px] text-blue-600 dark:text-blue-400 font-black">GHS {p.currentPrice.toFixed(2)}</span>
                                                          </>
                                                       ) : (
                                                          <span className="text-[10px] text-slate-500 font-bold">GHS {p.price.toFixed(2)}</span>
                                                       )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors">
                                                {p.dailyVelocity > 2 ? <ArrowUpRight size={12} className="text-teal-600 dark:text-teal-400" /> : <TrendingDown size={12} className="text-orange-500" />}
                                                {p.dailyVelocity}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                               <div className="flex items-center gap-1.5">
                                                   {isLow && <AlertCircle size={14} className="text-red-500" />}
                                                   <p className={`font-black text-lg tracking-tighter transition-all ${isLow ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                                                       {p.stock}
                                                   </p>
                                               </div>
                                               <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">UNITS</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-slate-400 dark:text-slate-500">
                                            <span className="text-xs font-black font-mono">{reorderPoint}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {suggestedPO > 0 ? (
                                                <button 
                                                  onClick={() => {
                                                    addToOrder(p.id);
                                                    setIsModalOpen(true);
                                                  }}
                                                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 transition-all hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
                                                >
                                                    <Plus size={10} /> {suggestedPO}
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest transition-colors">Optimized</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                              onClick={() => handleEditProduct(p)}
                                              className="text-slate-300 dark:text-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'suppliers' && (
          <motion.div 
            key="suppliers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {suppliers.map(s => (
                <div key={s.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none card-hover transition-colors">
                   <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 rounded-2xl flex items-center justify-center font-black text-xl transition-colors border border-transparent dark:border-slate-700">
                            {s.name[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white tracking-tight leading-tight transition-colors">{s.name}</h3>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-1">{s.cat} Vendor</p>
                        </div>
                   </div>
                   
                   <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 transition-colors">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chief Representative</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{s.contact}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors">
                                <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600" />
                                {s.phone}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors">
                                <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600" />
                                {s.email}
                            </div>
                        </div>
                   </div>

                   <button 
                    onClick={() => {
                      setSelectedSupplierState(s);
                      setIsSupplierModalOpen(true);
                    }}
                    className="w-full mt-10 py-4 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                   >
                        View Fulfillment History <ChevronRight size={14} />
                   </button>
                </div>
            ))}
            <button className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-4 hover:border-blue-400 dark:hover:border-blue-900 hover:text-blue-500 dark:hover:text-blue-400 transition-all group">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Plus size={32} />
                </div>
                <p className="font-black text-xs uppercase tracking-[0.2em]">Onboard New Vendor</p>
            </button>
          </motion.div>
        )}

        {activeSubTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* ... holiday discount UI ... */}
            <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                  <Zap size={120} className="text-blue-400" />
               </div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-2 text-center md:text-left">
                     <h3 className="text-3xl font-black text-white tracking-tight">Holiday Sales Logic</h3>
                     <p className="text-slate-400 font-bold max-w-md">Apply real-time percentage discounts across your entire catalog for seasonal campaigns.</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                     {activeHoliday ? (
                        <div className="flex flex-col items-center gap-4">
                           <div className="px-6 py-3 bg-blue-500/20 border border-blue-500/40 rounded-2xl flex items-center gap-3">
                              <Star size={16} className="text-blue-400 animate-spin-slow" />
                              <span className="text-white font-black uppercase text-xs tracking-widest">{activeHoliday.name} • {activeHoliday.discount}% OFF</span>
                           </div>
                           <button 
                             onClick={() => setActiveHoliday(null)}
                             className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                           >
                              Deactivate Campaign
                           </button>
                        </div>
                     ) : (
                        <button 
                          onClick={() => setIsHolidayModalOpen(true)}
                          className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                           <Calendar size={14} /> Schedule Global Discount
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
                  <div className="flex justify-between items-center">
                     <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Supplier Reliability</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated by fulfillment success (%)</p>
                     </div>
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                        <Truck size={20} />
                     </div>
                  </div>
                  <div className="space-y-6">
                     {supplierPerformance.map((s, idx) => (
                        <div key={idx} className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                              <span className="font-black text-blue-600 dark:text-blue-400">{s.reliability}%</span>
                           </div>
                           <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${s.reliability}%` }}
                                 className={`h-full ${Number(s.reliability) > 85 ? 'bg-teal-500' : Number(s.reliability) > 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
                  <div className="flex justify-between items-center">
                     <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Spend Analytics</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total cost of procurement by vendor</p>
                     </div>
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                        <BarChart3 size={20} />
                     </div>
                  </div>
                  <div className="space-y-6">
                     {supplierPerformance.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-xs font-black border border-slate-100 dark:border-slate-800">
                                 {s.name[0]}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{s.name}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.orderCount} Orders</p>
                              </div>
                           </div>
                           <p className="font-black text-slate-900 dark:text-white tracking-tighter text-sm">GHS {s.totalSpend.toLocaleString()}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'orders' && (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Order History Archive</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chronological log of all procurement activity</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                   <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 transition-colors">
                       {['all', 'pending', 'received'].map(status => (
                         <button
                           key={status}
                           onClick={() => setPoStatusFilter(status as any)}
                           className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex-1 md:flex-none ${
                             poStatusFilter === status 
                               ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                           }`}
                         >
                           {status}
                         </button>
                       ))}
                   </div>
                   <button 
                     onClick={() => {
                       setEditingPOId(null);
                       setOrderItems([]);
                       setSelectedSupplierId('');
                       setIsModalOpen(true);
                     }}
                     className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 justify-center"
                   >
                       <Plus size={16} /> New Order
                   </button>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.15em]">
                        <tr>
                            <th className="px-8 py-5">Order Reference</th>
                            <th className="px-8 py-5">Vendor</th>
                            <th className="px-8 py-5 text-center">Fulfillment Date</th>
                            <th className="px-8 py-5 text-right">Total Amount</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {sortedPurchaseOrders
                          .filter(o => poStatusFilter === 'all' || o.status === poStatusFilter)
                          .map(o => (
                            <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <p className="font-black text-slate-900 dark:text-white transition-colors">{o.id}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm transition-colors">{o.supplier}</p>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">{o.date}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <p className="font-black text-blue-600 dark:text-blue-400 transition-colors">GHS {o.total.toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        o.status === 'received' 
                                          ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800' 
                                          : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800'
                                    }`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {o.status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={() => handleReceiveOrder(o.id)}
                                          className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg text-teal-600 transition-colors group relative"
                                          title="Confirm Receipt & Update Stock"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button 
                                          onClick={() => handleEditPO(o)}
                                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors group relative"
                                          title="Edit Order"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        <button 
                                          onClick={() => generateEmailPreview(o)}
                                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-500 transition-colors group relative"
                                          title="Email to Supplier"
                                        >
                                            <Mail size={18} />
                                        </button>
                                      </>
                                    )}
                                    {o.status === 'received' && (
                                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                          <FileText size={18} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
