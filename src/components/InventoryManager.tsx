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
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SubTab = 'products' | 'suppliers' | 'orders';

export default function InventoryManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('products');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    { id: '1', name: 'Coca Cola 500ml', sku: 'SODA-001', cat: 'Drinks', price: 12.0, stock: 45, threshold: 20, dailyVelocity: 5.2 },
    { id: '2', name: 'Milo 400g Tray', sku: 'BEV-042', cat: 'Groceries', price: 85.5, stock: 8, threshold: 15, dailyVelocity: 2.1 },
    { id: '3', name: 'A4 Paper (Ream)', sku: 'STAT-11', cat: 'Stationery', price: 45.0, stock: 120, threshold: 30, dailyVelocity: 1.5 },
    { id: '4', name: 'Apple MacBook Air', sku: 'ELEC-99', cat: 'Electronics', price: 15000.0, stock: 2, threshold: 5, dailyVelocity: 0.1 },
    { id: '5', name: 'Hand Sanitizer 1L', sku: 'HLTH-05', cat: 'Health', price: 25.0, stock: 15, threshold: 25, dailyVelocity: 4.8 },
  ];

  const suppliers = [
    { id: 's1', name: 'Coca-Cola Bottling Ltd', contact: 'Kofi Manu', phone: '+233 24 000 1111', email: 'orders@coke.gh', cat: 'Beverages' },
    { id: 's2', name: 'Nestle Ghana', contact: 'Ama Serwaa', phone: '+233 50 222 3333', email: 'sales@nestle.gh', cat: 'Groceries' },
    { id: 's3', name: 'Kingdom Books', contact: 'Yaw Boateng', phone: '+233 27 444 5555', email: 'biz@kingdom.com', cat: 'Stationery' },
  ];

  const purchaseOrders = [
    { id: 'PO-8821', supplier: 'Nestle Ghana', date: '2026-04-18', status: 'pending', total: 4200 },
    { id: 'PO-8820', supplier: 'Kingdom Books', date: '2026-04-15', status: 'received', total: 1500 },
  ];

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.threshold), [products]);

  return (
    <div className="space-y-8 pb-20">
      {/* Module Header */}
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
            { id: 'orders', name: 'P. Orders', icon: FileText },
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
                      placeholder="Filter by SKU, Name or Category..." 
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white h-12 pl-12 pr-4 rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-colors"
                    />
                  </div>
                  <button className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
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
                            {products.map((p, i) => {
                                const isLow = p.stock <= p.threshold;
                                // Reorder point = velocity * 7 (weekly lead time) + threshold
                                const reorderPoint = Math.ceil(p.dailyVelocity * 7 + p.threshold);
                                const suggestedPO = Math.max(0, reorderPoint - p.stock);

                                return (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 font-black relative overflow-hidden transition-colors">
                                                    {p.name[0]}
                                                    {isLow && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-slate-100 dark:border-slate-800 rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white leading-tight transition-colors">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">{p.sku} • {p.cat}</p>
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
                                            <p className={`font-black text-lg tracking-tighter transition-all ${isLow ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                                                {p.stock}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">UNITS</p>
                                        </td>
                                        <td className="px-8 py-6 text-center text-slate-400 dark:text-slate-500">
                                            <span className="text-xs font-black font-mono">{reorderPoint}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {suggestedPO > 0 ? (
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 transition-colors">
                                                    <Plus size={10} /> {suggestedPO}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest transition-colors">Optimized</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-slate-300 dark:text-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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

                   <button className="w-full mt-10 py-4 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
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

        {activeSubTab === 'orders' && (
           <motion.div 
             key="orders"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-6"
           >
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
                        {purchaseOrders.map(o => (
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
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <FileText size={18} />
                                    </button>
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
