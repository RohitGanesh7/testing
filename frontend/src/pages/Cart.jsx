import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, tax, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (items.length === 0) {
      setMessage('  Cart is empty!')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      // Create orders for each item in cart
      const orders = []
      for (const item of items) {
        const res = await api.post('/api/v1/orders', {
          product_id: item.id,
          quantity: item.quantity
        })
        orders.push(res.data)
      }

      setMessage(`✅ Order placed successfully! Transaction ID: ${Date.now()}`)
      setMessageType('success')
      clearCart()

      // Redirect to orders after 2 seconds
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (err) {
      setMessage(err.response?.data?.detail || '❌ Checkout failed')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !message) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold mb-4">🛒 Your Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🛒 Shopping Cart</h1>
        <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
      </div>

      {message && (
        <div className={`alert-${messageType} mb-6`}>
          <span>{messageType === 'success' ? '✅' : '❌'}</span>
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex gap-4">
                    <div className="text-5xl">📦</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-sm font-semibold text-blue-600 mb-4">
                        ${item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-200 rounded"
                            disabled={loading}
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-200 rounded"
                            disabled={loading || item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-lg font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-500 hover:text-red-700 font-semibold"
                          disabled={loading}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">📋 Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="text-green-600 font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="btn-primary w-full mb-3"
            >
              {loading ? '⏳ Processing...' : '💳 Proceed to Checkout'}
            </button>

            <button
              onClick={() => navigate('/products')}
              className="btn-secondary w-full"
              disabled={loading}
            >
              Continue Shopping
            </button>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 text-sm font-semibold w-full mt-3"
                disabled={loading}
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
