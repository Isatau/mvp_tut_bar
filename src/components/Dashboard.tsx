import React from 'react';
import { useStore } from '../store';
import { 
  TrendingUp, ShoppingBag, Printer, AlertTriangle, 
  Banknote, CreditCard, Clock, CheckCircle 
} from 'lucide-react';

export function Dashboard() {
  const { orders, printJobs, menuItems } = useStore();

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const paidOrders = todayOrders.filter(o => o.status === 'paid');
  const openOrders = todayOrders.filter(o => o.status !== 'paid');
  const errorJobs = printJobs.filter(j => j.status === 'error');

  const todayRevenue = paidOrders.reduce((sum, o) => {
    return sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }, 0);

  const cashPayments = paidOrders.filter(o => 
    o.payments?.some(p => p.method === 'cash' || p.method === 'mixed')
  ).length;
  const cardPayments = paidOrders.filter(o => 
    o.payments?.some(p => p.method === 'card' || p.method === 'mixed')
  ).length;

  const activeItems = menuItems.filter(m => m.active).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Сводка за сегодня</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Выручка"
          value={`${todayRevenue.toLocaleString()} ₽`}
          color="green"
        />
        <StatCard
          icon={<ShoppingBag size={24} />}
          label="Заказов"
          value={todayOrders.length.toString()}
          subtitle={`${paidOrders.length} оплачено`}
          color="blue"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Открытых"
          value={openOrders.length.toString()}
          subtitle="ожидают"
          color="yellow"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          label="Ошибки печати"
          value={errorJobs.length.toString()}
          subtitle={errorJobs.length > 0 ? 'требуют внимания' : 'всё ок'}
          color={errorJobs.length > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Banknote size={18} /> Способы оплаты
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Banknote size={16} className="text-green-600" /> Наличные
              </span>
              <span className="font-bold">{cashPayments}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" /> Карта
              </span>
              <span className="font-bold">{cardPayments}</span>
            </div>
          </div>
        </div>

        {/* Print Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Printer size={18} /> Статус печати
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🍸 Бар (USB)</span>
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle size={14} /> Готов
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🍳 Кухня (LAN)</span>
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle size={14} /> Готов
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Всего заданий</span>
              <span className="font-bold">{printJobs.length}</span>
            </div>
          </div>
        </div>

        {/* Menu Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} /> Меню
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Активных позиций</span>
              <span className="font-bold">{activeItems}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Всего позиций</span>
              <span className="font-bold">{menuItems.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🍸 Бар</span>
              <span className="font-bold">{menuItems.filter(m => m.station === 'BAR' && m.active).length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>🍳 Кухня</span>
              <span className="font-bold">{menuItems.filter(m => m.station === 'KITCHEN' && m.active).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {todayOrders.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Последние заказы</h3>
          <div className="space-y-2">
            {todayOrders.slice(-5).reverse().map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold">#{order.number}</span>
                  {order.tableNumber && <span className="text-xs text-gray-500">Стол {order.tableNumber}</span>}
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{order.items.reduce((s, i) => s + i.price * i.quantity, 0)} ₽</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.status === 'print_error' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status === 'paid' ? '✓ Оплачен' : 
                     order.status === 'draft' ? 'Черновик' :
                     order.status === 'sent_to_production' ? 'На производстве' :
                     order.status === 'pending_payment' ? 'Ожидает оплаты' :
                     order.status === 'print_error' ? 'Ошибка печати' : '...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
    </div>
  );
}
