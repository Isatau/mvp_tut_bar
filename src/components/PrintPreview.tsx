import React from 'react';
import { useStore } from '../store';
import type { PrintJob, Order } from '../types';
import { Printer, X, RefreshCw } from 'lucide-react';

interface PrintPreviewProps {
  job: PrintJob;
  onClose: () => void;
}

export function PrintPreview({ job, onClose }: PrintPreviewProps) {
  const { printerSettings, retryPrintJob } = useStore();
  const order = useStore(state => state.orders.find(o => o.id === job.orderId));

  const total = job.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleRetry = () => {
    retryPrintJob(job.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Printer size={18} />
            {job.type === 'production' ? 'Производственный талон' : 'Чек покупателя'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6 font-mono text-sm bg-gray-50">
          <div className="border-2 border-dashed border-gray-300 p-4 bg-white">
            {/* Header */}
            <div className="text-center mb-3">
              <p className="font-bold text-base">{printerSettings.restaurantName}</p>
              {job.type === 'production' && (
                <p className="text-xs text-gray-500">
                  {job.station === 'BAR' ? '═══ БАР ═══' : '═══ КУХНЯ ═══'}
                </p>
              )}
              {job.type === 'receipt' && (
                <p className="text-xs text-gray-500">═══ ЧЕК ═══</p>
              )}
            </div>

            {/* Order Info */}
            <div className="mb-3 text-xs">
              <div className="flex justify-between">
                <span>Заказ: #{job.orderNumber}</span>
                <span>{new Date(job.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span>Время: {new Date(job.createdAt).toLocaleTimeString('ru-RU')}</span>
                {job.tableNumber && <span>Стол: {job.tableNumber}</span>}
              </div>
              {job.isReprint && (
                <p className="text-center text-orange-600 font-bold mt-1">
                  *** ПОВТОРНАЯ ПЕЧАТЬ ***
                </p>
              )}
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Items */}
            <div className="space-y-1 mb-3">
              {job.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="flex-1">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="ml-2">{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>

            {/* Comment */}
            {job.comment && (
              <div className="text-xs bg-yellow-50 p-2 rounded mb-2">
                💬 {job.comment}
              </div>
            )}

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Total for receipt */}
            {job.type === 'receipt' && order?.payments && order.payments.length > 0 && (
              <div className="text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>ИТОГО:</span>
                  <span>{total} ₽</span>
                </div>
                {order.payments.map(p => (
                  <div key={p.id}>
                    {p.method === 'cash' && (
                      <>
                        <div className="flex justify-between">
                          <span>Наличные:</span>
                          <span>{p.receivedAmount} ₽</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Сдача:</span>
                          <span>{p.change} ₽</span>
                        </div>
                      </>
                    )}
                    {p.method === 'card' && (
                      <div className="flex justify-between">
                        <span>Карта:</span>
                        <span>{p.amount} ₽</span>
                      </div>
                    )}
                    {p.method === 'mixed' && (
                      <>
                        <div className="flex justify-between">
                          <span>Наличные:</span>
                          <span>{p.cashAmount} ₽</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Карта:</span>
                          <span>{p.cardAmount} ₽</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 mt-3">
              <p>Спасибо за посещение!</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-2">
          {job.status === 'error' && (
            <button
              onClick={handleRetry}
              className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Повторить печать
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
