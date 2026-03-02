import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import api from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/api/v1/products/${id}`)
      .then(res => {
        setProduct(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const addToCart = () => {
    try {
      addItem(product, quantity)
      setMessage('✅ Added to cart! Redirecting...')
      setMessageType('success')
      setTimeout(() => {
        navigate('/cart')
      }, 1000)
    } catch (err) {
      setMessage(err.message || 'Failed to add to cart')
      setMessageType('error')
    }
  }

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading product...</p>
      </div>
    )

  if (!product)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="alert-error">
          <span>❌</span>
          <span>Product not found</span>
        </div>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-96">
          <div className="text-8xl">📦</div>
        </div>
        <div>
          <div className="mb-4">
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">
              {product.category || 'Uncategorized'}
            </span>
            <h1 className="text-4xl font-bold mt-2">{product.name}</h1>
          </div>

          <p className="text-gray-600 text-lg mb-6">{product.description}</p>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Price:</span>
              <span className="text-4xl font-bold text-blue-500">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock:</span>
              <span
                className={`text-lg font-semibold ${
                  product.stock_quantity === 0
                    ? 'text-red-500'
                    : product.stock_quantity < 5
                    ? 'text-orange-500'
                    : 'text-green-500'
                }`}
              >
                {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} Available`}
              </span>
            </div>
          </div>

          {message && (
            <div className={`alert-${messageType} mb-6`}>
              <span>{messageType === 'success' ? '✔️' : '❌'}</span>
              <span>{message}</span>
            </div>
          )}

          {product.stock_quantity > 0 && (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={e => setQuantity(Math.min(Number(e.target.value), product.stock_quantity))}
                />
              </div>
              <button
                onClick={addToCart}
                className="btn-primary w-full py-4 text-lg font-bold"
              >
                🛒 Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
