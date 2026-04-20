import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Search,
  ShoppingCart as CartIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function POSTerminal() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const products = [
    { id: '1', name: 'Coffee Latte', price: 25.5, category: 'Drinks' },
    { id: '2', name: 'Blueberry Muffin', price: 18.0, category: 'Food' },
    { id: '3', name: 'Fresh Orange Juice', price: 15.0, category: 'Drinks' },
    { id: '4', name: 'Grilled Sandwich', price: 42.0, category: 'Food' },
    { id: '5', name: 'Bottled Water', price: 5.0, category: 'Drinks' },
    { id: '6', name: 'Chocolate Cookie', price: 12.0, category: 'Snacks' },
  ];

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePayment = (provider: string) => {
    if (cart.length === 0) return;
    setActiveProvider(provider);
    setPaymentStatus('processing');
    
    // Simulate API call delay
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        setPaymentStatus('idle');
        setCart([]);
        setActiveProvider(null);
      }, 3000);
    }, 2500);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="relative flex h-full gap-6 overflow-hidden">
      {/* Payment Overlay */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4"
            >
              {paymentStatus === 'processing' ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Loader2 size={64} className="text-blue-600 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connecting to {activeProvider}</h3>
                    <p className="text-sm text-slate-500">Please authorize the prompt on your phone...</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">GHS {total.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                    >
                      <CheckCircle2 size={64} className="text-green-500" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful</h3>
                    <p className="text-sm text-slate-500">Transaction ID: FLW-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                  </div>
                  <button 
                    onClick={() => setPaymentStatus('idle')}
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm"
                  >
                    Close & Start New Sale
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Product Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex gap-2 mb-6 shrink-0 overflow-x-auto pb-2 custom-scrollbar">
          <button className="px-5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-200">All Items</button>
          {['Electronics', 'Fashion', 'Home', 'Health', 'Drinks', 'Food'].map(cat => (
            <button key={cat} className="px-5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:border-blue-400 hover:text-blue-600 transition-all whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4 custom-scrollbar">
          {products.map((product) => (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/40 card-hover flex flex-col gap-3 group transition-colors"
            >
              <div className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/${product.id}/400`} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 text-left">{product.name}</h3>
                <div className="flex justify-between items-center mt-2 font-mono">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-lg">GHS {product.price.toFixed(2)}</span>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">STK 24</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <aside className="w-[340px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40 overflow-hidden shrink-0 transition-colors">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-100/30 dark:bg-slate-800/20">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CartIcon size={18} className="text-blue-600" />
            Active Cart
          </h2>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Order #8291</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 text-center space-y-3">
              <CartIcon size={48} className="opacity-10" />
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Cart Empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={`https://picsum.photos/seed/${item.id}/200`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5"> {item.quantity} × GHS {item.price.toFixed(2)}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 font-mono">
                  <p className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  <button className="text-slate-300 dark:text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white">GHS {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              <span>VAT 0%</span>
              <span className="font-mono text-slate-900 dark:text-white">GHS 0.00</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-4 mt-2 text-xl tracking-tighter">
              <span>TOTAL</span>
              <span className="text-blue-600 dark:text-blue-400">GHS {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 shrink-0">
          <button 
            onClick={() => handlePayment('Paystack')}
            className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <CreditCard size={16} />
            Paystack
          </button>
          <button 
            onClick={() => handlePayment('Flutterwave')}
            className="w-full py-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98]"
          >
            <Smartphone size={16} />
            Flutterwave
          </button>
          <button 
            onClick={() => {
              setCart([]);
              alert('Cash payment recorded.');
            }}
            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Cash Out
          </button>
        </div>
      </aside>
    </div>
  );
}
