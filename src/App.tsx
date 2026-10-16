import React, { useState } from 'react';
import { POSScreen } from './components/POSScreen';
import { AdminPanel } from './components/AdminPanel';
import { OrderHistory } from './components/OrderHistory';
import { Dashboard } from './components/Dashboard';
import { useStore } from './store';
import { 
  Monitor, Settings, History, LayoutDashboard 
} from 'lucide-react';

type Screen = 'pos' | 'dashboard' | 'admin' | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('pos');
  const { orders, printJobs } = useStore();

  const openOrdersCount = orders.filter(o => o.status !== 'paid').length;
  const errorJobsCount = printJobs.filter(j => j.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-2 mr-4">
                <span className="text-xl">🍽️</span>
                <span className="font-bold text-gray-800 hidden sm:block">RestoCore</span>
                <span className="text-xs text-gray-400 hidden sm:block">v1.1</span>
              </div>
              
              <NavButton
                active={screen === 'pos'}
                onClick={() => setScreen('pos')}
                icon={<Monitor size={18} />}
                badge={openOrdersCount > 0 ? openOrdersCount : undefined}
              >
                Касса
              </NavButton>
              
              <NavButton
                active={screen === 'dashboard'}
                onClick={() => setScreen('dashboard')}
                icon={<LayoutDashboard size={18} />}
              >
                Сводка
              </NavButton>
              
              <NavButton
                active={screen === 'history'}
                onClick={() => setScreen('history')}
                icon={<History size={18} />}
              >
                История
              </NavButton>
              
              <NavButton
                active={screen === 'admin'}
                onClick={() => setScreen('admin')}
                icon={<Settings size={18} />}
                badge={errorJobsCount > 0 ? errorJobsCount : undefined}
                badgeColor="red"
              >
                Админ
              </NavButton>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="hidden md:block">
                {new Date().toLocaleDateString('ru-RU', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="hidden md:block">Система активна</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Screen Content */}
      <main>
        {screen === 'pos' && <POSScreen />}
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'admin' && <AdminPanel />}
        {screen === 'history' && <OrderHistory />}
      </main>
    </div>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  children, 
  badge,
  badgeColor = 'blue'
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  badge?: number;
  badgeColor?: 'blue' | 'red';
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
        active 
          ? 'bg-orange-50 text-orange-700' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center ${
          badgeColor === 'red' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
