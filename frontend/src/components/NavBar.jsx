import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-100 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-500">
          🛍️ ShopHub
        </Link>
        <div className="flex gap-6 items-center flex-1 ml-8">
          {user && (
            <>
              <Link
                to="/products"
                className={`font-semibold transition-colors ${
                  isActive('/products') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Products
              </Link>
              <Link
                to="/cart"
                className={`font-semibold transition-colors relative ${
                  isActive('/cart') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                🛒 Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {user ? (
            <>
              <span className="text-gray-800 font-medium mr-4">Hi, {user.username}</span>
              <Link
                to="/orders"
                className={`font-semibold transition-colors ${
                  isActive('/orders') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                className={`font-semibold transition-colors ${
                  isActive('/profile') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`font-semibold transition-colors ${
                  isActive('/login') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`font-semibold transition-colors ${
                  isActive('/register') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
