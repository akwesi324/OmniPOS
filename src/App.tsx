import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  User as UserIcon,
  Search,
  Github,
  Bell,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { getFirebase } from './lib/firebase';
import type { User } from './types';

// Components
import Dashboard from './components/Dashboard';
import POSTerminal from './components/POSTerminal';
import InventoryManager from './components/InventoryManager';
import CustomerManager from './components/CustomerManager';
import Reports from './components/Reports';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const fb = await getFirebase();
      if (!fb) {
        setUser({
          uid: 'mock-1',
          email: 'admin@omnipos.com',
          displayName: 'Administrator',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      }
      setIsAuthReady(true);
    };
    checkAuth();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg shadow-blue-100"
        />
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', name: 'POS Terminal', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="bg-slate-900 flex flex-col items-center py-6 z-30 transition-all duration-300"
      >
        <div className="mb-10 px-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
            <ShoppingCart size={24} />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-white"
            >
              OmniPOS
            </motion.span>
          )}
        </div>

        <nav className="flex-1 w-full px-4 space-y-4">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} flex-shrink-0`}>
                  <item.icon size={22} />
                </div>
                {isSidebarOpen && (
                   <span className="font-semibold text-sm">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 w-full">
          <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all font-semibold group">
            <LogOut size={22} />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
          
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700 bg-blue-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
               {user?.displayName?.substring(0, 2).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="relative w-full max-w-lg group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search products (Name, ID, or Barcode)..." 
                className="w-full h-10 pl-10 pr-4 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-6">
            <div className="hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-600">System Online</span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/akwesi324" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="View Developer Profile"
              >
                <Github size={20} />
              </a>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Main Cashier • Shift #102</p>
              </div>
              <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-blue-600 transition-colors">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'pos' && <POSTerminal />}
              {activeTab === 'inventory' && <InventoryManager />}
              {activeTab === 'customers' && <CustomerManager />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'settings' && <Settings user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
