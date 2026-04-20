import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const pieData = [
  { name: 'Drinks', value: 400 },
  { name: 'Food', value: 300 },
  { name: 'Snacks', value: 300 },
  { name: 'Other', value: 200 },
];

const COLORS = ['#2563eb', '#f97316', '#8b5cf6', '#10b981'];

export default function Reports() {
  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 card-hover transition-colors">
          <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-white tracking-tight leading-none">Weekly Sales Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 700}} dy={10} className="text-slate-400 dark:text-slate-600" />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 700}} className="text-slate-400 dark:text-slate-600" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'var(--tw-backdrop-blur)', backdropFilter: 'blur(8px)' }}
                  wrapperClassName="dark:!bg-slate-900 dark:!border-slate-800"
                  cursor={{fill: 'currentColor'}}
                />
                <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 card-hover transition-colors">
          <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-white tracking-tight leading-none">Sales by Category</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 pl-4">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-white tracking-tight leading-none">Cashier Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Kweku Admin', orders: 145, total: 12500, color: 'blue' },
            { name: 'Naa Manager', orders: 89, total: 8400, color: 'orange' },
            { name: 'John Cashier', orders: 201, total: 11200, color: 'purple' },
          ].map((c) => (
            <div key={c.name} className="p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4 transition-colors">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-${c.color === 'blue' ? 'blue' : c.color === 'orange' ? 'orange' : 'purple'}-600 dark:text-${c.color === 'blue' ? 'blue' : c.color === 'orange' ? 'orange' : 'purple'}-400 uppercase`}>
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{c.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{c.orders} Orders</p>
                  </div>
               </div>
               <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Revenue</p>
                  <p className="font-black text-slate-900 dark:text-slate-100">GHS {c.total.toLocaleString()}</p>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-${c.color === 'blue' ? 'blue' : c.color === 'orange' ? 'orange' : 'purple'}-600 dark:bg-${c.color === 'blue' ? 'blue' : c.color === 'orange' ? 'orange' : 'purple'}-400`} style={{ width: `${(c.total / 15000) * 100}%` }} />
                </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
