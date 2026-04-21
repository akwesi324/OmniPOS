import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  ShieldCheck, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  CreditCard
} from 'lucide-react';
import { getFirebase } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ConfigState {
  paystackPublicKey: string;
  paystackSecretKey: string;
}

export default function Settings({ user }: { user: any }) {
  const [config, setConfig] = useState<ConfigState>({
    paystackPublicKey: '',
    paystackSecretKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const fb = await getFirebase();
        if (!fb) {
          // If firebase is not configured, we might be in mock mode
          setLoading(false);
          return;
        }

        const configDoc = await getDoc(doc(fb.db, 'config', 'system'));
        if (configDoc.exists()) {
          setConfig(configDoc.data() as ConfigState);
        }
      } catch (err: any) {
        console.error('Error fetching config:', err);
        setError('Failed to load system configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const fb = await getFirebase();
      if (!fb) throw new Error('Firebase not initialized');

      await setDoc(doc(fb.db, 'config', 'system'), {
        ...config,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'anonymous'
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving config:', err);
      setError('Failed to save configuration. Please ensure you have permission.');
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading system configuration...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600">
           <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm">Only system administrators can access and modify global configuration settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
         <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <SettingsIcon size={24} />
         </div>
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Global Management Panel</p>
         </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Paystack Section */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Paystack Configuration</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Gateway Keys</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ShieldCheck size={12} className="text-green-600" />
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Secure Entry</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paystack Public Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Key size={18} />
                </div>
                <input 
                  type={showKeys['public'] ? 'text' : 'password'}
                  value={config.paystackPublicKey}
                  onChange={(e) => setConfig({ ...config, paystackPublicKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-mono dark:text-white"
                />
                <button 
                  type="button"
                  onClick={() => toggleShowKey('public')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showKeys['public'] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 ml-1">Visible on your Paystack dashboard. Used for client-side interactions.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paystack Secret Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showKeys['secret'] ? 'text' : 'password'}
                  value={config.paystackSecretKey}
                  onChange={(e) => setConfig({ ...config, paystackSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm font-mono dark:text-white"
                />
                <button 
                  type="button"
                  onClick={() => toggleShowKey('secret')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showKeys['secret'] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 ml-1 font-bold text-red-500/80">NEVER share this key. It is used on the server to process sensitive payments.</p>
            </div>
          </div>
        </section>

        {/* Global Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600"
            >
              <AlertCircle size={20} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center gap-3 text-green-600"
            >
              <CheckCircle2 size={20} />
              <p className="text-xs font-bold uppercase tracking-tight">Settings Saved Successfully</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
