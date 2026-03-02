import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../contexts/CartContext'

export default function Products() {
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const pageSize = 12

  useEffect(() => {
    fetchProducts()
  }, [page])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/v1/products/', { params: { page, page_size: pageSize } })
      setProducts(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  // apply simple client-side search filter
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
<div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">🛍️ Our Products</h1>
          <p className="text-gray-600">Browse our amazing collection</p>
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input w-full md:w-64"
        />
      </div>

      {error && (
        <div className="alert-error mb-6">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="alert-info">
          <span>📭</span>
          <span>No products match your search</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filtered.map(p => (
              <div key={p.id} className="product-card flex flex-col">
                <Link to={`/products/${p.id}`} className="no-underline flex-1 flex flex-col">
                  <div className="product-image">📦</div>
                  <div className="product-body">
                    <div className="product-category">{p.category || 'Uncategorized'}</div>
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-description">{p.description?.substring(0, 80) || 'No description'}...</p>
                    <div className="product-meta">
                      <div className="product-price">${p.price.toFixed(2)}</div>
                      <div
                        className={`product-stock ${p.stock_quantity === 0 ? 'out' : p.stock_quantity < 5 ? 'low' : ''}`}
                      >
                        {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} in stock`}
                      </div>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => addItem(p, 1)}
                  className="btn-secondary w-full mt-auto"
                  disabled={p.stock_quantity === 0}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage(1)} disabled={page === 1} className="btn-secondary">
                ⬅️ First
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg font-semibold ${
                      p === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary">
                Next →
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="btn-secondary">
                Last ⟹
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
