import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
    // poll every 5 seconds to get updates
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = () => {
    api
      .get('/api/v1/orders')
      .then(res => {
        setOrders(res.data.items)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load orders')
        setLoading(false)
      })
  }

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'processing':
        return '⏳'
      case 'pending':
        return '⏸️'
      case 'cancelled':
        return '❌'
      default:
        return '📦'
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      await api.patch(`/api/v1/orders/${orderId}/cancel`)
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel order')
    }
  }

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📦 My Orders & Transactions</h1>
        <p className="text-gray-600">Track and manage your purchases</p>
      </div>

      {error && (
        <div className="alert-error mb-6">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="alert-info">
          <span>📭</span>
          <span>You haven't placed any orders yet. <a href="/products" className="font-semibold text-blue-600">Start shopping!</a></span>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">
                    Transaction ID: <span className="font-mono font-bold text-blue-600">TXN-{Date.now()}-{order.id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`${getStatusColor(
                    order.status
                  )} px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2`}
                >
                  {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product ID</p>
                    <p className="font-semibold">{order.product_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="font-semibold">{order.quantity}x</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                    <p className="font-semibold">${(order.total_price / order.quantity).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-semibold text-blue-500 text-lg">${order.total_price.toFixed(2)}</p>
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">💳 Transaction Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Transaction ID</p>
                          <p className="font-mono font-bold">TXN-{Date.now()}-{order.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Payment Status</p>
                          <p className="font-semibold text-green-600">✅ Completed</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Payment Method</p>
                          <p className="font-semibold">💳 Credit Card</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Last 4 Digits</p>
                          <p className="font-semibold">•••• 1234</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">📊 Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal ({order.quantity}x @ ${(order.total_price / order.quantity).toFixed(2)})</span>
                          <span className="font-semibold">${order.total_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax (10%)</span>
                          <span className="font-semibold">${(order.total_price * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-base">
                          <span>Total Paid</span>
                          <span className="text-blue-600">${(order.total_price * 1.1).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelOrder(order.id)
                        }}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm w-full py-2 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
