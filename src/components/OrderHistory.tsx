import React, { useState } from 'react';
import { useStore } from '../store';
import type { PrintJob } from '../types';
import { PrintPreview } from './PrintPreview';
import { History, ChevronLeft, Eye, Printer, XCircle } from 'lucide-react';

export function OrderHistory() {
  const { orders, printJobs } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);

  const filteredOrders = orders
    .filter(o => {
      if (filter === 'paid') return o.status === 'paid';
      if (filter === 'unpaid') return o.status !== 'paid';
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selected = orders.find(o => o.id === selectedOrder);
  const orderPrintJobs = selected ? printJobs.filter(j => j.orderId === selected.id) : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <History size={24} /> История заказов
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Все ({orders.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Оплаченные ({orders.filter(o => o.status === 'paid').length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'unpaid' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Неоплаченные ({orders.filter(o => o.status !== 'paid').length})
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>Нет заказов</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredOrders.map(order => {
                  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
                  const orderJobs = printJobs.filter(j => j.orderId === order.id);
                  const hasErrors = orderJobs.some(j => j.status === 'error');

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 flex items-center gap-4 ${
                        selectedOrder === order.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">#{order.number}</span>
                          {order.tableNumber && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Стол {order.tableNumber}</span>
                          )}
                          {hasErrors && <XCircle size={14} className="text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{total} ₽</p>
                        <p className={`text-xs ${
                          order.status === 'paid' ? 'text-green-600' :
                          order.status === 'print_error' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {order.status === 'draft' && 'Черновик'}
                          {order.status === 'pending_send' && 'Ожидает отправки'}
                          {order.status === 'sent_to_production' && 'На производстве'}
                          {order.status === 'pending_payment' && 'Ожидает оплаты'}
                          {order.status === 'paid' && '✓ Оплачен'}
                          {order.status === 'print_error' && 'Ошибка печати'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {selected ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Заказ #{selected.number}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Дата:</span>
                    <span>{new Date(selected.createdAt).toLocaleString('ru-RU')}</span>
                  </div>
                  {selected.tableNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Стол:</span>
                      <span>{selected.tableNumber}</span>
                    </div>
                  )}
                  {selected.comment && (
                    <div className="text-sm bg-yellow-50 rounded p-2">
                      💬 {selected.comment}
                    </div>
                  )}
                </div>

                <h4 className="font-medium text-sm text-gray-500 mb-2">Позиции:</h4>
                <div className="space-y-1 mb-4">
                  {selected.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${item.station === 'BAR' ? 'text-purple-600' : 'text-green-600'}`}>
                          {item.station === 'BAR' ? '🍸' : '🍳'}
                        </span>
                        <span>{item.name}</span>
                        <span className="text-gray-400">×{item.quantity}</span>
                        {item.sentToProduction && <span className="text-xs text-green-500">✓</span>}
                      </div>
                      <span className="font-medium">{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between font-bold">
                    <span>Итого:</span>
                    <span>{selected.items.reduce((s, i) => s + i.price * i.quantity, 0)} ₽</span>
                  </div>
                </div>

                {/* Payment Info */}
                {selected.payments && selected.payments.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-sm text-green-700 mb-2">Оплата:</h4>
                    {selected.payments.map(p => (
                      <div key={p.id} className="text-sm">
                        <p>
                          {p.method === 'cash' && `💵 Наличные: ${p.amount} ₽`}
                          {p.method === 'card' && `💳 Карта: ${p.amount} ₽`}
                          {p.method === 'mixed' && `💵 Наличные: ${p.cashAmount} ₽ + 💳 Карта: ${p.cardAmount} ₽`}
                        </p>
                        {p.method === 'cash' && p.change !== undefined && (
                          <p className="text-green-600">Сдача: {p.change} ₽</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(p.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Print Jobs */}
                {orderPrintJobs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-2">Печать:</h4>
                    <div className="space-y-1">
                      {orderPrintJobs.map(job => (
                        <button
                          key={job.id}
                          onClick={() => setPreviewJob(job)}
                          className={`w-full flex items-center gap-2 text-xs p-2 rounded text-left hover:opacity-80 ${
                            job.status === 'error' ? 'bg-red-50' :
                            job.status === 'printed' ? 'bg-green-50' :
                            'bg-yellow-50'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            job.status === 'error' ? 'bg-red-500' :
                            job.status === 'printed' ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`} />
                          <span>{job.station === 'BAR' ? '🍸' : '🍳'} {job.type === 'production' ? 'Талон' : 'Чек'}</span>
                          {job.isReprint && <span className="text-orange-600">(повтор)</span>}
                          <Printer size={12} className="ml-auto text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Eye size={48} className="mx-auto mb-3 opacity-50" />
                <p>Выберите заказ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {previewJob && (
        <PrintPreview job={previewJob} onClose={() => setPreviewJob(null)} />
      )}
    </div>
  );
}
