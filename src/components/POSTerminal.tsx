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
  Scan,
  Printer,
  ChevronRight,
  Zap
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
  const [momoProvider, setMomoProvider] = useState('mtn');
  const [otp, setOtp] = useState('');
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Customer');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);

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
          const endpoint = activeProvider === 'Paystack' 
            ? `/api/payments/paystack/verify/${txRef}`
            : activeProvider === 'Hubtel'
            ? `/api/payments/hubtel/verify/${txRef}`
            : `/api/payments/flutterwave/verify/${txRef}`;
            
          const verifyRes = await fetch(endpoint);
          const verifyResult = await verifyRes.json();
          if (verifyResult.status === true && (verifyResult.data?.status === 'success' || verifyResult.data?.status === 'successful')) {
            completeSale();
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [paymentStatus, transactionDetails, activeProvider]);

  const completeSale = (methodOverride?: string) => {
    setLastOrderDetails({
      items: [...cart],
      subtotal,
      discount,
      tax,
      total,
      method: methodOverride || activeProvider || 'Cash',
      customer: selectedCustomer,
      date: new Date().toLocaleString(),
      orderId: `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    });
    setPaymentStatus('success');
    setShowReceipt(true);
    setCart([]);
    setPhoneNumber('');
    setOtp('');
    setDiscount(0);
  };

  const handlePayment = async (provider: string, phone: string) => {
    if (cart.length === 0) return;
    setActiveProvider(provider);
    setErrorMessage(null);
    setPaymentStatus('initializing');
    setIsMoMoModalOpen(false);

    try {
      let endpoint = '/api/payments/paystack/initialize';
      if (provider === 'Flutterwave') endpoint = '/api/payments/flutterwave/initialize';
      if (provider === 'Hubtel') endpoint = '/api/payments/hubtel/initialize';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: 'customer@example.com',
          phone: phone,
          currency: 'GHS',
          provider: momoProvider,
          channel: 'mobile_money'
        })
      });

      const result = await response.json();
      
      if (result.status === true || result.status === 'success') {
        const data = result.data;
        setTransactionDetails(data);
        if (data.status === 'send_otp') {
          setPaymentStatus('otp_required');
        } else {
          setPaymentStatus('waiting');
        }
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

      setPaymentStatus('waiting');
    } catch (err) {
      setPaymentStatus('error');
      setErrorMessage('Network error during verification');
    }
  };

  return (
    <div className="relative flex h-full gap-6 overflow-hidden bg-slate-50 dark:bg-slate-950 p-6 font-sans">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhoneNumber(val);
                        // Auto-detect provider
                        if (val.startsWith('024') || val.startsWith('054') || val.startsWith('055') || val.startsWith('059') || val.startsWith('025')) setMomoProvider('mtn');
                        else if (val.startsWith('020') || val.startsWith('050')) setMomoProvider('vod');
                        else if (val.startsWith('026') || val.startsWith('056') || val.startsWith('027') || val.startsWith('057')) setMomoProvider('tgo');
                      }}
                      placeholder="e.g. 055 123 4567"
                      className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network</label>
                    <select 
                      value={momoProvider}
                      onChange={(e) => setMomoProvider(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="mtn">MTN</option>
                      <option value="vod">Vodafone</option>
                      <option value="tgo">AirtelTigo</option>
                    </select>
                  </div>
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
                        {paymentStatus === 'waiting' && 'Awaiting Authorisation...'}
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
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{activeProvider}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</span>
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
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sale Confirmed</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{lastOrderDetails?.orderId}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4 border border-slate-100 dark:border-slate-800">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid</span>
                            <span className="text-blue-600 font-mono text-base font-black">GHS {lastOrderDetails?.total.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</span>
                            <span className="text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-wider">{lastOrderDetails?.method}</span>
                         </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          setPaymentStatus('idle');
                          setShowReceipt(false);
                        }}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10 dark:shadow-none"
                      >
                        Start New Sale
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            setShowReceipt(true);
                            // We need a small delay to ensure the modal is rendered before printing
                            setTimeout(() => window.print(), 100);
                          }}
                          className="py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Printer size={14} />
                          Print Receipt
                        </button>
                        <button 
                          onClick={() => setShowReceipt(true)}
                          className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <CartIcon size={14} />
                          Details
                        </button>
                      </div>
                    </div>
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
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{errorMessage || 'The payment was declined or timed out.'}</p>
                    </div>
                    <button 
                      onClick={() => setPaymentStatus('idle')}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all font-mono"
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

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastOrderDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative printable-receipt"
            >
              <div className="p-8 space-y-8">
                 <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 no-print">
                       <Printer size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Receipt</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{lastOrderDetails.orderId}</p>
                 </div>

                 <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                    {lastOrderDetails.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.quantity} x GHS {item.price.toFixed(2)}</span>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white font-mono">GHS {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                 </div>

                 <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Subtotal</span>
                       <span className="text-slate-900 dark:text-white">GHS {lastOrderDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Tax (17.5%)</span>
                       <span className="text-slate-900 dark:text-white">GHS {lastOrderDetails.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">Total Paid</span>
                       <span className="text-2xl font-black text-blue-600 font-mono">GHS {lastOrderDetails.total.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Method</span>
                       <span className="text-slate-700 dark:text-white">{lastOrderDetails.method}</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Date</span>
                       <span className="text-slate-700 dark:text-white">{lastOrderDetails.date}</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Customer</span>
                       <span className="text-slate-700 dark:text-white">{lastOrderDetails.customer}</span>
                    </div>
                 </div>

                 <div className="flex gap-3 no-print">
                    <button 
                      onClick={() => {
                        setPaymentStatus('idle');
                        setShowReceipt(false);
                      }}
                      className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Product Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-6 bg-slate-50/30 dark:bg-slate-800/10">
          <div className="flex justify-between items-center">
             <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inventory</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5">Ready for checkout</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 flex items-center gap-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <UserIcon size={16} className="text-blue-600" />
                  <select 
                    value={selectedCustomer} 
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="bg-transparent text-xs font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    <option>Walk-in Customer</option>
                    <option>John Doe (024...)</option>
                    <option>Jane Smith (055...)</option>
                    <option>Kwame Nkrumah (020...)</option>
                  </select>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
             </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search product name or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold dark:text-white shadow-sm"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Scan</span>
               <Scan size={20} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 custom-scrollbar pb-12">
          {filteredProducts.map((product) => (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col gap-4 group text-left relative overflow-hidden"
            >
              <div className="w-full h-40 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 overflow-hidden relative border border-slate-100/50 dark:border-slate-700">
                <img 
                  src={`https://picsum.photos/seed/${product.id}/600`} 
                  alt={product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-xl text-[10px] font-black text-blue-600 border border-blue-500/10 shadow-sm font-mono">
                   {product.barcode}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 line-clamp-1 truncate uppercase tracking-tight">{product.name}</h3>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-blue-600 dark:text-blue-400 font-black text-lg font-mono">GHS {product.price.toFixed(2)}</span>
                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${product.stock <= 10 ? 'text-orange-500' : 'text-slate-400 opacity-60'}`}>In Stock: {product.stock}</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:translate-y-[-2px] transition-all">
                    <Plus size={24} />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-24 text-center space-y-6">
              <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                <Search size={40} />
              </div>
              <div className="space-y-1">
                 <p className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-tight">No Results Found</p>
                 <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Try searching for a name or barcode</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Area */}
      <aside className="w-[420px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden shrink-0">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
                <CartIcon size={20} className="text-blue-600" />
             </div>
             <div className="space-y-0.5">
                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wide text-xs">Current Sale</h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{cart.length} items</p>
             </div>
          </div>
          <button 
            onClick={() => setCart([])}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
          >
            Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 text-center space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] shadow-inner">
                <CartIcon size={64} className="opacity-10" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-900 dark:text-slate-200 uppercase tracking-[0.2em] opacity-40">Cart Empty</p>
                <p className="text-xs text-slate-400 font-medium max-w-[200px] leading-relaxed">Please select products from the inventory to build a customer order</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-5 group">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                  <img src={`https://picsum.photos/seed/${item.id}/200`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 space-y-2 text-left">
                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white leading-snug uppercase tracking-tight truncate">{item.name}</h4>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} className="rotate-45" />
                    </button>
                    <span className="text-xs font-black font-mono w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors ml-auto block"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white text-xs">GHS {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center group">
               <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Applied Discount</label>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] text-slate-400 font-black opacity-40">GHS</span>
                 <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-right outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                 />
               </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              <span className="opacity-60">Tax (17.5%)</span>
              <span className="font-mono text-slate-900 dark:text-white text-xs opacity-60">GHS {tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-6 mt-4">
              <div className="space-y-0.5">
                 <span className="uppercase text-[9px] font-black text-slate-400 tracking-[0.2em] block">Grand Total</span>
                 <span className="text-slate-900 dark:text-white font-black text-sm uppercase">Amount Due</span>
              </div>
              <span className="text-3xl text-blue-600 dark:text-blue-400 font-black font-mono tracking-tighter drop-shadow-sm">GHS {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
             <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => {
                    setActiveProvider('Paystack');
                    setIsMoMoModalOpen(true);
                  }}
                  disabled={cart.length === 0}
                  className="py-5 bg-blue-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:translate-y-[-2px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:translate-y-0"
                >
                  <Smartphone size={20} />
                  MoMo
                </button>
                
                <button 
                  onClick={() => {
                    setActiveProvider('Hubtel');
                    setIsMoMoModalOpen(true);
                  }}
                  disabled={cart.length === 0}
                  className="py-5 bg-teal-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 hover:bg-teal-700 hover:translate-y-[-2px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:translate-y-0"
                >
                  <Zap size={20} />
                  Hubtel
                </button>
             </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                   onClick={() => {
                      alert(`Processing Card Payment for GHS ${total.toFixed(2)}`);
                      setPaymentStatus('success');
                      completeSale('Card');
                   }}
                   disabled={cart.length === 0}
                   className="py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-650 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-650 transition-all font-mono"
                >
                  <CreditCard size={14} />
                  Card
                </button>

                <button 
                   onClick={() => {
                      alert(`Proceeding with Split payment`);
                   }}
                   disabled={cart.length === 0}
                   className="py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-650 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-650 transition-all font-mono"
                >
                  <XCircle size={14} className="rotate-45" />
                  Split
                </button>
              </div>
          </div>

          <button 
            onClick={() => {
              completeSale('Cash');
            }}
            disabled={cart.length === 0}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 dark:shadow-none"
          >
            <Banknote size={20} />
            Cash Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}
