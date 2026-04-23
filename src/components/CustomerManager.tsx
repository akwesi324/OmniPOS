import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, MapPin, X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  pts: number;
  city: string;
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<MockCustomer[]>([
    { id: '1', name: 'Kojo Appiah', phone: '+233 24 555 1234', email: 'kojo@example.com', pts: 450, city: 'Accra' },
    { id: '2', name: 'Ama Serwaa', phone: '+233 50 111 9876', email: 'ama@mail.gh', pts: 1200, city: 'Kumasi' },
    { id: '3', name: 'Yaw Boateng', phone: '+233 27 000 4455', email: 'yaw@corp.com', pts: 85, city: 'Tema' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email) return;

    const added: MockCustomer = {
      id: Math.random().toString(36).substring(2, 9),
      ...newCustomer,
      pts: 0
    };

    setCustomers([added, ...customers]);
    setIsModalOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', city: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Customer Database</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Manage loyalty points and purchase history</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest"
        >
          <UserPlus size={16} />
          Register Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none card-hover flex flex-col transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl flex items-center justify-center text-xl font-black border border-slate-100 dark:border-slate-700 transition-colors">
                {customer.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white tracking-tight leading-tight transition-colors">{customer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 transition-colors">Verified Member</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-tight transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                  <Phone size={14} />
                </div>
                {customer.phone || 'No phone provided'}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold lowercase tracking-tight transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                  <Mail size={14} />
                </div>
                {customer.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-tight transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                  <MapPin size={14} />
                </div>
                {customer.city || 'Location N/A'}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">Loyalty Wallet</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tighter transition-colors">{customer.pts.toLocaleString()} PTS</p>
              </div>
              <button className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Details</button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">New Customer</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Enter customer name"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="customer@example.com"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input 
                      type="tel" 
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="+233..."
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <input 
                      type="text" 
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                      placeholder="Accra"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all uppercase"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
