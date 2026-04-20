import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Today\'s Sales', value: 'GHS 4,250.00', change: '+12.5%', isUp: true, icon: DollarSign, color: 'blue' },
    { name: 'Active Orders', value: '18', change: '+2', isUp: true, icon: ShoppingBag, color: 'orange' },
    { name: 'New Customers', value: '12', change: '-3.2%', isUp: false, icon: Users, color: 'purple' },
    { name: 'Revenue Growth', value: '24.8%', change: '+4.3%', isUp: true, icon: TrendingUp, color: 'green' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 flex flex-col card-hover transition-colors">
            <div className={`w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700 transition-colors`}>
              <stat.icon size={22} className={stat.color === 'blue' ? 'text-blue-600' : stat.color === 'orange' ? 'text-orange-500' : stat.color === 'purple' ? 'text-purple-600' : 'text-teal-600'} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.name}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">{stat.value}</h3>
              <div className={`flex items-center text-[10px] font-black ${stat.isUp ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'} bg-${stat.isUp ? 'teal' : 'red'}-50 dark:bg-${stat.isUp ? 'teal' : 'red'}-900/20 px-2 py-1 rounded-lg border border-${stat.isUp ? 'teal' : 'red'}-100 dark:border-${stat.isUp ? 'teal' : 'red'}-900/30 transition-colors`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 min-h-[400px] transition-colors">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tight dark:text-white">Revenue Timeline</h3>
            <div className="flex gap-2">
               {['D', 'W', 'M'].map(t => (
                 <button key={t} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${t === 'W' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                   {t}
                 </button>
               ))}
            </div>
          </div>
          <div className="h-[250px] flex flex-col items-center justify-center text-slate-200 dark:text-slate-700 font-mono italic gap-4 relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               {/* Pattern */}
               <div className="w-full h-full border-b border-l border-slate-200 dark:border-slate-800" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] font-black text-slate-300 dark:text-slate-800">Live Matrix Visualization</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
          <h3 className="text-xl font-black tracking-tight mb-8 dark:text-white">Recent Feed</h3>
          <div className="flex-1 space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-5 last:border-0 last:pb-0 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 font-mono text-xs border border-slate-100 dark:border-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                    {i}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">TXN-00{i*12}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">POS Terminal • 12:0{i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-slate-900 dark:text-white tracking-tighter">GHS {(Math.random() * 200 + 40).toFixed(2)}</p>
                  <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Verified</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-slate-700 transition-all shadow-xl shadow-slate-900/10">
            Export Transaction Logs
          </button>
        </div>
      </div>
    </div>
  );
}
