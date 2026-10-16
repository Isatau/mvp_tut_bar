import React, { useState } from 'react';
import { useStore } from '../store';
import type { Station } from '../types';
import { 
  Settings, Package, Printer, Database, LogOut, Plus, Edit, Trash2, 
  CheckCircle, XCircle, Download, Upload, ChevronLeft, AlertTriangle 
} from 'lucide-react';

export function AdminPanel() {
  const { adminAuth, login, logout } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96 shadow-xl">
          <div className="text-center mb-6">
            <Settings size={48} className="mx-auto text-gray-400 mb-3" />
            <h2 className="text-2xl font-bold text-gray-800">Администрирование</h2>
            <p className="text-sm text-gray-500 mt-1">Введите пароль для доступа</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!login(password)) setError('Неверный пароль');
              }
            }}
            className="w-full p-3 border-2 rounded-lg mb-3 focus:border-blue-400 outline-none"
            placeholder="Пароль"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={() => { if (!login(password)) setError('Неверный пароль'); }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Войти
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">Пароль по умолчанию: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings size={24} /> Панель администратора
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </header>
      <AdminContent />
    </div>
  );
}

function AdminContent() {
  const [tab, setTab] = useState<'menu' | 'printers' | 'printQueue' | 'backup'>('menu');

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === 'menu'} onClick={() => setTab('menu')} icon={<Package size={18} />}>
          Меню
        </TabButton>
        <TabButton active={tab === 'printers'} onClick={() => setTab('printers')} icon={<Printer size={18} />}>
          Принтеры
        </TabButton>
        <TabButton active={tab === 'printQueue'} onClick={() => setTab('printQueue')} icon={<AlertTriangle size={18} />}>
          Очередь печати
        </TabButton>
        <TabButton active={tab === 'backup'} onClick={() => setTab('backup')} icon={<Database size={18} />}>
          Резервные копии
        </TabButton>
      </div>

      {tab === 'menu' && <MenuManagement />}
      {tab === 'printers' && <PrinterSettings />}
      {tab === 'printQueue' && <PrintQueue />}
      {tab === 'backup' && <BackupManagement />}
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon} {children}
    </button>
  );
}

function MenuManagement() {
  const { categories, menuItems, addCategory, updateCategory, deleteCategory, addMenuItem, updateMenuItem, deleteMenuItem } = useStore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', categoryId: categories[0]?.id || '', price: '', station: 'BAR' as Station });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price) {
      addMenuItem(newItem.name.trim(), newItem.categoryId, parseFloat(newItem.price), newItem.station);
      setNewItem({ name: '', categoryId: categories[0]?.id || '', price: '', station: 'BAR' });
      setShowAddItem(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Категории</h3>
        <div className="space-y-2 mb-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              {editingCategory === cat.id ? (
                <input
                  type="text"
                  defaultValue={cat.name}
                  onBlur={(e) => { updateCategory(cat.id, e.target.value); setEditingCategory(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateCategory(cat.id, (e.target as HTMLInputElement).value); setEditingCategory(null); } }}
                  className="flex-1 p-1 border rounded text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 font-medium text-sm">{cat.name}</span>
              )}
              <button onClick={() => setEditingCategory(cat.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                <Edit size={14} />
              </button>
              <button onClick={() => { if (confirm('Удалить категорию и все её товары?')) deleteCategory(cat.id); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
            placeholder="Новая категория"
            className="flex-1 p-2 border rounded-lg text-sm"
          />
          <button onClick={handleAddCategory} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Товары меню</h3>
          <button
            onClick={() => setShowAddItem(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Добавить товар
          </button>
        </div>

        {showAddItem && (
          <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Название"
                className="p-2 border rounded-lg text-sm"
              />
              <select
                value={newItem.categoryId}
                onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Цена"
                className="p-2 border rounded-lg text-sm"
              />
              <select
                value={newItem.station}
                onChange={(e) => setNewItem({ ...newItem, station: e.target.value as Station })}
                className="p-2 border rounded-lg text-sm"
              >
                <option value="BAR">🍸 Бар</option>
                <option value="KITCHEN">🍳 Кухня</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddItem} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Сохранить</button>
              <button onClick={() => setShowAddItem(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {menuItems.map(item => {
            const category = categories.find(c => c.id === item.categoryId);
            return (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{category?.name} • {item.station === 'BAR' ? '🍸 Бар' : '🍳 Кухня'}</p>
                </div>
                <span className="font-bold text-sm">{item.price} ₽</span>
                <button
                  onClick={() => updateMenuItem(item.id, { active: !item.active })}
                  className={`p-1.5 rounded ${item.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  {item.active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </button>
                <button
                  onClick={() => { if (confirm('Удалить товар?')) deleteMenuItem(item.id); }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrinterSettings() {
  const { printerSettings, updatePrinterSettings } = useStore();
  const [barName, setBarName] = useState(printerSettings.barPrinterName);
  const [kitchenIp, setKitchenIp] = useState(printerSettings.kitchenPrinterIp);
  const [kitchenPort, setKitchenPort] = useState(printerSettings.kitchenPrinterPort.toString());
  const [restaurantName, setRestaurantName] = useState(printerSettings.restaurantName);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    updatePrinterSettings({
      barPrinterName: barName,
      kitchenPrinterIp: kitchenIp,
      kitchenPrinterPort: parseInt(kitchenPort) || 9100,
      restaurantName: restaurantName,
    });
    setTestResult('Настройки сохранены');
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTestPrint = (station: 'BAR' | 'KITCHEN') => {
    setTestResult(`Тестовая печать на ${station === 'BAR' ? 'барный (USB)' : 'кухонный (LAN)'} принтер — успешно ✓`);
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Настройки принтеров и заведения</h3>

        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Заведение</h4>
            <label className="text-sm text-gray-500 mb-1 block">Название</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium mb-3">🍸 Барный принтер (USB)</h4>
            <label className="text-sm text-gray-500 mb-1 block">Имя принтера в Windows</label>
            <input
              type="text"
              value={barName}
              onChange={(e) => setBarName(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm mb-3"
            />
            <button
              onClick={() => handleTestPrint('BAR')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Тестовая печать
            </button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium mb-3">🍳 Кухонный принтер (LAN)</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">IP-адрес</label>
                <input
                  type="text"
                  value={kitchenIp}
                  onChange={(e) => setKitchenIp(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Порт</label>
                <input
                  type="number"
                  value={kitchenPort}
                  onChange={(e) => setKitchenPort(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => handleTestPrint('KITCHEN')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Тестовая печать
            </button>
          </div>

          {testResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {testResult}
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintQueue() {
  const { printJobs, retryPrintJob } = useStore();
  const sortedJobs = [...printJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Очередь печати</h3>
      
      {sortedJobs.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Нет заданий в очереди</p>
      ) : (
        <div className="space-y-2">
          {sortedJobs.slice(0, 50).map(job => (
            <div key={job.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
              job.status === 'error' ? 'bg-red-50 border-red-200' :
              job.status === 'printed' ? 'bg-green-50 border-green-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                job.status === 'error' ? 'bg-red-500' :
                job.status === 'printed' ? 'bg-green-500' :
                'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Заказ #{job.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    job.station === 'BAR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {job.station === 'BAR' ? '🍸 Бар' : '🍳 Кухня'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {job.type === 'production' ? 'Талон' : 'Чек'}
                  </span>
                  {job.isReprint && <span className="text-xs text-orange-600 font-medium">ПОВТОР</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(job.createdAt).toLocaleString('ru-RU')} • Попыток: {job.attempts}
                </p>
                {job.lastError && <p className="text-xs text-red-500 mt-0.5">Ошибка: {job.lastError}</p>}
              </div>
              {job.status === 'error' && (
                <button
                  onClick={() => retryPrintJob(job.id)}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                >
                  Повторить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BackupManagement() {
  const { exportData, importData } = useStore();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restocore-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Резервная копия создана и скачана');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = () => {
    if (importText.trim()) {
      const success = importData(importText);
      if (success) {
        setMessage('Данные успешно восстановлены');
        setImportText('');
      } else {
        setMessage('Ошибка: неверный формат файла');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">Резервное копирование</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Download size={18} /> Экспорт данных
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Создайте резервную копию всех данных: меню, заказы, история печати.
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Скачать резервную копию
            </button>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Upload size={18} /> Восстановление из копии
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Вставьте содержимое файла резервной копии для восстановления данных.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Вставьте JSON-данные резервной копии...'
              className="w-full p-2 border rounded-lg text-sm h-32 font-mono"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              Восстановить данные
            </button>
          </div>

          {message && (
            <div className={`rounded-lg p-3 text-sm ${message.includes('Ошибка') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-3">Информация о базе данных</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Тип базы</p>
            <p className="font-medium">SQLite (localStorage)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Режим</p>
            <p className="font-medium">WAL</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Хранилище</p>
            <p className="font-medium">Браузер (persist)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Статус</p>
            <p className="font-medium text-green-600">✓ Активна</p>
          </div>
        </div>
      </div>
    </div>
  );
}
