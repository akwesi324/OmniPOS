import { useState } from 'react';
import { Search, UserPlus, Phone, Mail, MapPin } from 'lucide-react';

export default function CustomerManager() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Customer Database</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Manage loyalty points and purchase history</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest">
          <UserPlus size={16} />
          Register Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Kojo Appiah', phone: '+233 24 555 1234', email: 'kojo@example.com', pts: 450, city: 'Accra' },
          { name: 'Ama Serwaa', phone: '+233 50 111 9876', email: 'ama@mail.gh', pts: 1200, city: 'Kumasi' },
          { name: 'Yaw Boateng', phone: '+233 27 000 4455', email: 'yaw@corp.com', pts: 85, city: 'Tema' },
        ].map((customer, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none card-hover flex flex-col transition-colors">
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
                {customer.phone}
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
                {customer.city}
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
    </div>
  );
}
