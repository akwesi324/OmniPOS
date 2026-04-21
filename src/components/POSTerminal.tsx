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
  XCircle,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function POSTerminal() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initializing' | 'waiting' | 'verifying' | 'otp_required' | 'success' | 'error'>('idle');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Customer');

  const TAX_RATE = 0.175; // 17.5%

  const products = [
    { id: '1', name: 'Coffee Latte', price: 25.5, category: 'Drinks', barcode: '101', stock: 42 },
    { id: '2', name: 'Blueberry Muffin', price: 18.0, category: 'Food', barcode: '102', stock: 15 },
    { id: '3', name: 'Fresh Orange Juice', price: 15.0, category: 'Drinks', barcode: '103', stock: 24 },
    { id: '4', name: 'Grilled Sandwich', price: 42.0, category: 'Food', barcode: '104', stock: 8 },
    { id: '5', name: 'Bottled Water', price: 5.0, category: 'Drinks', barcode: '105', stock: 100 },
    { id: '6', name: 'Chocolate Cookie', price: 12.0, category: 'Snacks', barcode: '106', stock: 20 },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        const product = products.find(p => p.id === productId);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.max(0, (subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + tax);

  useEffect(() => {
    let interval: any;
    if (paymentStatus === 'otp_required' || paymentStatus === 'waiting' || paymentStatus === 'verifying') {
      interval = setInterval(async () => {
        const txRef = transactionDetails?.reference || transactionDetails?.tx_ref;
        if (!txRef) return;
        try {
          const verifyRes = await fetch(`/api/payments/paystack/verify/${txRef}`);
          const verifyResult = await verifyRes.json();
          if (verifyResult.status === true && (verifyResult.data?.status === 'success' || verifyResult.data?.status === 'successful')) {
            setPaymentStatus('success');
            setCart([]);
            setPhoneNumber('');
            setOtp('');
            setDiscount(0);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [paymentStatus, transactionDetails]);

  const handlePayment = async (provider: string, phone: string) => {
    if (cart.length === 0) return;
    setActiveProvider(provider);
    setErrorMessage(null);
    setPaymentStatus('initializing');
    setIsMoMoModalOpen(false);

    try {
      const endpoint = provider === 'Paystack' ? '/api/payments/paystack/initialize' : '/api/payments/flutterwave/initialize';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: 'customer@example.com',
          phone: phone,
          currency: 'GHS',
          provider: 'mtn',
          channel: 'mobile_money'
        })
      });

      const result = await response.json();
      
      if (result.status === true || result.status === 'success') {
        setTransactionDetails(result.data);
        setPaymentStatus('otp_required');
      } else {
        setPaymentStatus('error');
        setErrorMessage(result.message || 'Failed to initialize payment gateway');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('Could not connect to payment server');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter a valid OTP');
      return;
    }

    setPaymentStatus('verifying');
    setErrorMessage(null);
    const txRef = transactionDetails?.reference || transactionDetails?.tx_ref;

    try {
      if (activeProvider === 'Paystack') {
        const otpRes = await fetch('/api/payments/paystack/submit-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: txRef, otp })
        });
        const otpResult = await otpRes.json();
        
        if (!otpResult.status) {
          setPaymentStatus('otp_required');
          setErrorMessage(otpResult.message || 'OTP Submission Failed');
          return;
        }
      }

      const verifyEndpoint = activeProvider === 'Paystack' 
        ? `/api/payments/paystack/verify/${txRef}` 
        : `/api/payments/flutterwave/verify/${txRef}?tx_ref=${txRef}`;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      const verifyRes = await fetch(verifyEndpoint);
      const verifyResult = await verifyRes.json();

      const isVerified = verifyResult.status === true || 
                         verifyResult.status === 'success' || 
                         verifyResult.data?.status === 'success';

      if (isVerified) {
        setPaymentStatus('success');
        setCart([]);
        setPhoneNumber('');
        setOtp('');
        setDiscount(0);
      } else if (verifyResult.data?.status === 'pending') {
        setPaymentStatus('otp_required');
        setErrorMessage('Payment still pending. Please authorize on your phone.');
      } else {
        setPaymentStatus('error');
        setErrorMessage(verifyResult.message || 'Payment Verification Failed');
      }
    } catch (err) {
      setPaymentStatus('error');
      setErrorMessage('Network error during verification');
    }
  };

  return (
    <div className="relative flex h-full gap-6 overflow-hidden bg-slate-50 dark:bg-slate-950 p-6">
      <AnimatePresence>
        {isMoMoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 space-y-6"
            >
              <div className="flex items-center gap-4 text-blue-600">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mobile Money</h3>
                  <p className="text-xs text-slate-500 font-medium">MTN / Vodafone / AirtelTigo</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 055 123 4567"
                    className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsMoMoModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handlePayment(activeProvider!, phoneNumber)}
                    disabled={!phoneNumber || phoneNumber.length < 10}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 overflow-hidden"
            >
              <div className="p-8">
                {['initializing', 'waiting', 'verifying', 'otp_required'].includes(paymentStatus) ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <Loader2 size={64} className={`text-blue-600 ${paymentStatus === 'otp_required' ? '' : 'animate-spin'}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {paymentStatus === 'initializing' && 'Initializing Gateway...'}
                        {paymentStatus === 'waiting' && `Waiting for ${activeProvider}...`}
                        {paymentStatus === 'verifying' && 'Verifying Payment...'}
                        {paymentStatus === 'otp_required' && 'OTP Verification'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {paymentStatus === 'otp_required' ? `An OTP has been sent to ${phoneNumber}.` : paymentStatus === 'waiting' ? 'Please complete the prompt on your mobile device.' : 'Finalizing transaction details...'}
                      </p>
                    </div>
                    
                    {paymentStatus === 'otp_required' && (
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          maxLength={6}
                          className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-center text-lg font-mono tracking-[0.5em] focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                        {errorMessage && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errorMessage}</p>}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setPaymentStatus('idle')}
                            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleVerifyOtp}
                            className="flex-2 py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {transactionDetails && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2 text-left border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</span>
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                            {(transactionDetails.reference || transactionDetails.tx_ref)?.substring(0, 12)}...
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{activeProvider}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Amount Due</span>
                      <p className="text-sm font-black text-blue-600">GHS {total.toFixed(2)}</p>
                    </div>
                  </div>
                ) : paymentStatus === 'success' ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                      >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={48} className="text-green-500" />
                        </div>
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sale Complete</h3>
                      <p className="text-sm text-slate-500">Receipt generated successfully.</p>
                    </div>
                    <button 
                      onClick={() => setPaymentStatus('idle')}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertCircle size={48} className="text-red-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">Transaction Failed</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{errorMessage || 'The payment was declined or timed out.'}</p>
                    </div>
                    <button 
                      onClick={() => setPaymentStatus('idle')}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Product Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Products</h2>
             <div className="flex items-center gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <UserIcon size={14} className="text-slate-400" />
                  <select 
                    value={selectedCustomer} 
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option>Walk-in Customer</option>
                    <option>John Doe (024...)</option>
                    <option>Jane Smith (055...)</option>
                  </select>
                </div>
             </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search product name or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium dark:text-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
               <Scan size={18} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 custom-scrollbar">
          {filteredProducts.map((product) => (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/50 transition-all flex flex-col gap-3 group text-left relative"
            >
              <div className="w-full h-32 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden relative border border-slate-100 dark:border-slate-700">
                <img 
                  src={`https://picsum.photos/seed/${product.id}/400`} 
                  alt={product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg text-[9px] font-black text-blue-600 border border-blue-500/10">
                   BC: {product.barcode}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{product.name}</h3>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-blue-600 dark:text-blue-400 font-black text-base">GHS {product.price.toFixed(2)}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${product.stock <= 10 ? 'text-orange-500' : 'text-slate-400'}`}>Stock: {product.stock}</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No products found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Area */}
      <aside className="w-[380px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-xl overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide text-sm">
            <CartIcon size={18} className="text-blue-600" />
            Active Cart
          </h2>
          <button 
            onClick={() => setCart([])}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 text-center space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full">
                <CartIcon size={48} className="opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Cart Empty</p>
                <p className="text-xs text-slate-400 font-medium max-w-[160px]">Search and add products to start a sale</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                  <img src={`https://picsum.photos/seed/${item.id}/200`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.name}</h4>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Plus size={12} className="rotate-45" />
                    </button>
                    <span className="text-xs font-black font-mono w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white text-xs">GHS {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center group">
               <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Discount</label>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-400 font-mono">-GHS</span>
                 <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right outline-none focus:ring-1 focus:ring-blue-500"
                 />
               </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              <span>Tax (GHS {(subtotal - discount).toFixed(2)} @ 17.5%)</span>
              <span className="font-mono text-slate-900 dark:text-white text-xs">GHS {tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
              <span className="uppercase text-xs tracking-widest">Grand Total</span>
              <span className="text-2xl text-blue-600 dark:text-blue-400 font-mono tracking-tighter">GHS {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              setActiveProvider('Paystack');
              setIsMoMoModalOpen(true);
            }}
            disabled={cart.length === 0}
            className="col-span-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
          >
            <Smartphone size={16} />
            Mobile Money (MoMo)
          </button>
          
          <button 
             onClick={() => {
                alert(`Processing Card Payment for GHS ${total.toFixed(2)}`);
                setPaymentStatus('success');
                setCart([]);
             }}
             disabled={cart.length === 0}
             className="py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <CreditCard size={14} />
            Card
          </button>

          <button 
             onClick={() => {
                alert(`Proceeding with Split payment`);
             }}
             disabled={cart.length === 0}
             className="py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <XCircle size={14} className="rotate-45" />
            Split
          </button>

          <button 
            onClick={() => {
              setCart([]);
              alert('Cash payment recorded.');
              setPaymentStatus('success');
            }}
            disabled={cart.length === 0}
            className="col-span-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Banknote size={16} />
            Cash Out
          </button>
        </div>
      </aside>
    </div>
  );
}
