import React, { useState } from 'react';
import { useStore } from '../store';
import type { MenuItem, Order } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, Send, CreditCard, Banknote, MessageSquare, ChevronLeft } from 'lucide-react';

export function POSScreen() {
  const {
    categories,
    menuItems,
    orders,
    currentOrderId,
    createOrder,
    addOrderItem,
    updateOrderItemQuantity,
    removeOrderItem,
    updateOrderComment,
    sendOrderToProduction,
    setCurrentOrder,
    updateOrderStatus,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [showPayment, setShowPayment] = useState(false);
  const [showOrderList, setShowOrderList] = useState(false);
  const [tableNumber, setTableNumber] = useState<number | undefined>();
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [comment, setComment] = useState('');

  const currentOrder = orders.find(o => o.id === currentOrderId);
  const activeMenuItems = menuItems.filter(m => m.active && m.categoryId === selectedCategory);
  
  const orderTotal = currentOrder
    ? currentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    : 0;

  const handleCreateOrder = (table?: number) => {
    const id = createOrder(table);
    setTableNumber(table);
    setShowTableSelect(false);
    setCurrentOrder(id);
  };

  const handleAddItem = (item: MenuItem) => {
    let orderId = currentOrderId;
    if (!orderId) {
      orderId = createOrder(tableNumber);
    }
    addOrderItem(orderId, item);
  };

  const handleSendToProduction = () => {
    if (currentOrderId && currentOrder) {
      const hasUnsent = currentOrder.items.some(i => !i.sentToProduction);
      if (!hasUnsent) return;
      sendOrderToProduction(currentOrderId);
      // Only change status if it was draft or pending_send
      if (currentOrder.status === 'draft' || currentOrder.status === 'pending_send') {
        updateOrderStatus(currentOrderId, 'sent_to_production');
      }
    }
  };

  const handleOpenOrder = (order: Order) => {
    setCurrentOrder(order.id);
    setTableNumber(order.tableNumber);
    setComment(order.comment || '');
    setShowOrderList(false);
  };

  const openOrders = orders.filter(o => o.status !== 'paid');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">🍽️ RestoCore POS</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOrderList(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              Заказы ({openOrders.length})
            </button>
            <button
              onClick={() => setShowTableSelect(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {tableNumber ? `Стол ${tableNumber}` : '+ Новый заказ'}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-3 gap-3 overflow-y-auto flex-1">
          {activeMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] text-left border-2 border-transparent hover:border-orange-300"
            >
              <div className="flex items-start justify-between">
                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.station === 'BAR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  {item.station === 'BAR' ? '🍸 Бар' : '🍳 Кухня'}
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-orange-600">
                {item.price} ₽
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Current Order */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {currentOrder ? `Заказ #${currentOrder.number}` : 'Новый заказ'}
            </h2>
            {currentOrder && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                currentOrder.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                currentOrder.status === 'sent_to_production' ? 'bg-blue-200 text-blue-700' :
                currentOrder.status === 'pending_payment' ? 'bg-yellow-200 text-yellow-700' :
                currentOrder.status === 'paid' ? 'bg-green-200 text-green-700' :
                'bg-red-200 text-red-700'
              }`}>
                {currentOrder.status === 'draft' && 'Черновик'}
                {currentOrder.status === 'pending_send' && 'Ожидает отправки'}
                {currentOrder.status === 'sent_to_production' && 'На производстве'}
                {currentOrder.status === 'pending_payment' && 'Ожидает оплаты'}
                {currentOrder.status === 'paid' && 'Оплачен'}
                {currentOrder.status === 'print_error' && 'Ошибка печати'}
              </span>
            )}
          </div>
          {tableNumber && (
            <p className="text-sm text-gray-500 mt-1">Стол: {tableNumber}</p>
          )}
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentOrder && currentOrder.items.length > 0 ? (
            <div className="space-y-2">
              {/* Sent items header */}
              {currentOrder.items.some(i => i.sentToProduction) && currentOrder.items.some(i => !i.sentToProduction) && (
                <div className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">
                  Отправлено на производство
                </div>
              )}
              {currentOrder.items.filter(i => i.sentToProduction).map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 opacity-60">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-600">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.price} ₽ × {item.quantity}</p>
                  </div>
                  <span className="text-xs text-green-600">✓</span>
                  <div className="text-right font-bold text-sm w-16 text-gray-500">
                    {item.price * item.quantity} ₽
                  </div>
                </div>
              ))}
              {/* Unsent items header */}
              {currentOrder.items.some(i => i.sentToProduction) && currentOrder.items.some(i => !i.sentToProduction) && (
                <div className="text-xs text-orange-500 uppercase tracking-wide px-2 mb-1 pt-2 border-t border-orange-200">
                  Новые позиции
                </div>
              )}
              {currentOrder.items.filter(i => !i.sentToProduction).map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-orange-50">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.price} ₽ × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateOrderItemQuantity(currentOrderId!, item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateOrderItemQuantity(currentOrderId!, item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeOrderItem(currentOrderId!, item.id)}
                      className="w-7 h-7 rounded bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-right font-bold text-sm w-16">
                    {item.price * item.quantity} ₽
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-8">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p>Заказ пуст</p>
              <p className="text-sm">Выберите позиции из меню</p>
            </div>
          )}
        </div>

        {/* Comment */}
        {currentOrder && (
          <div className="px-4 py-2 border-t">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Комментарий к заказу..."
                value={currentOrder.comment || ''}
                onChange={(e) => {
                  setComment(e.target.value);
                  updateOrderComment(currentOrderId!, e.target.value);
                }}
                className="flex-1 text-sm border-b border-gray-200 focus:border-orange-400 outline-none py-1"
              />
            </div>
          </div>
        )}

        {/* Total & Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-medium text-gray-600">Итого:</span>
            <span className="text-2xl font-bold text-gray-800">{orderTotal} ₽</span>
          </div>
          <div className="flex gap-2 mb-2">
            {currentOrder && currentOrder.items.some(i => !i.sentToProduction) && (
              <button
                onClick={handleSendToProduction}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Send size={18} />
                На кухню/бар
              </button>
            )}
            {currentOrder && (
              <button
                onClick={() => {
                  if (currentOrder.status === 'sent_to_production' || currentOrder.status === 'pending_payment') {
                    updateOrderStatus(currentOrderId!, 'pending_payment');
                  }
                  setShowPayment(true);
                }}
                disabled={orderTotal === 0}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={18} />
                Оплата
              </button>
            )}
          </div>
          {currentOrder && (
            <button
              onClick={() => {
                setCurrentOrder(null);
                setTableNumber(undefined);
                setComment('');
              }}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              + Новый заказ
            </button>
          )}
        </div>
      </div>

      {/* Table Selection Modal */}
      {showTableSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Выбор стола</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => handleCreateOrder(num)}
                  className="p-3 bg-gray-100 rounded-lg hover:bg-orange-100 hover:border-orange-400 border-2 border-transparent font-medium"
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleCreateOrder(undefined)}
              className="w-full py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              Без стола (на вынос)
            </button>
            <button
              onClick={() => setShowTableSelect(false)}
              className="w-full py-2 mt-2 text-gray-500 hover:text-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Order List Modal */}
      {showOrderList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[80vh] shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Открытые заказы</h3>
              <button onClick={() => setShowOrderList(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {openOrders.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Нет открытых заказов</p>
              ) : (
                openOrders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => handleOpenOrder(order)}
                    className="w-full p-3 bg-gray-50 rounded-lg hover:bg-orange-50 text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold">#{order.number}</span>
                      {order.tableNumber && <span className="text-gray-500 ml-2">Стол {order.tableNumber}</span>}
                      <span className="text-gray-400 ml-2 text-sm">
                        {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{order.items.reduce((s, i) => s + i.price * i.quantity, 0)} ₽</div>
                      <div className="text-xs text-gray-500">
                        {order.status === 'draft' && 'Черновик'}
                        {order.status === 'sent_to_production' && 'На производстве'}
                        {order.status === 'pending_payment' && 'Ожидает оплаты'}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && currentOrder && (
        <PaymentModal
          order={currentOrder}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

function PaymentModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [method, setMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { processPayment } = useStore();

  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cash = parseFloat(cashAmount) || 0;
  const card = parseFloat(cardAmount) || 0;
  const received = parseFloat(receivedAmount) || 0;

  const canPay = () => {
    switch (method) {
      case 'cash': return received >= total;
      case 'card': return true;
      case 'mixed': return cash + card === total && cash > 0 && card > 0;
    }
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      const result = processPayment(
        order.id,
        method,
        method === 'mixed' ? cash : undefined,
        method === 'mixed' ? card : undefined,
        method === 'cash' ? received : undefined,
      );
      if (result) {
        setSuccess(true);
      }
      setProcessing(false);
    }, 500);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-96 text-center shadow-xl">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Оплата прошла!</h3>
          <p className="text-gray-500 mb-4">Заказ #{order.number} оплачен</p>
          <p className="text-3xl font-bold mb-6">{total} ₽</p>
          {method === 'cash' && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-500">Сдача: <span className="font-bold text-lg">{received - total} ₽</span></p>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Новый заказ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[450px] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Оплата заказа #{order.number}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">К оплате</p>
          <p className="text-4xl font-bold text-gray-800">{total} ₽</p>
        </div>

        {/* Payment Methods */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMethod('cash')}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
              method === 'cash' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Banknote size={18} /> Наличные
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
              method === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <CreditCard size={18} /> Карта
          </button>
          <button
            onClick={() => setMethod('mixed')}
            className={`flex-1 py-3 rounded-lg font-medium ${
              method === 'mixed' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Микс
          </button>
        </div>

        {/* Payment Details */}
        {method === 'cash' && (
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Получено от клиента</label>
              <input
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                className="w-full p-3 border-2 rounded-lg text-xl font-bold text-center focus:border-green-400 outline-none"
                placeholder="0"
              />
            </div>
            {received >= total && (
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500">Сдача: </span>
                <span className="text-xl font-bold text-green-600">{received - total} ₽</span>
              </div>
            )}
            {received > 0 && received < total && (
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <span className="text-sm text-red-600">Недостаточно средств</span>
              </div>
            )}
          </div>
        )}

        {method === 'card' && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Проведите оплату на банковском терминале</p>
            <p className="text-lg font-medium text-blue-700">Сумма: {total} ₽</p>
          </div>
        )}

        {method === 'mixed' && (
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Наличные</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full p-3 border-2 rounded-lg text-lg font-bold text-center focus:border-green-400 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Карта</label>
              <input
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="w-full p-3 border-2 rounded-lg text-lg font-bold text-center focus:border-blue-400 outline-none"
                placeholder="0"
              />
            </div>
            {cash + card > 0 && cash + card !== total && (
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <span className="text-sm text-red-600">
                  Сумма не совпадает: {cash + card} ₽ из {total} ₽
                </span>
              </div>
            )}
            {cash + card === total && (
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <span className="text-sm text-green-600">✓ Суммы совпадают</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={!canPay() || processing}
          className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Обработка...' : 'Подтвердить оплату'}
        </button>
      </div>
    </div>
  );
}
