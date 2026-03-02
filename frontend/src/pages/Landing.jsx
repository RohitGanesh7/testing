import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Redirect to products if already logged in
  if (user) {
    navigate('/products')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">
            🛍️ ShopHub
          </a>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-gray-700 font-semibold hover:text-blue-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Shop Your <span className="text-yellow-300">Favorites</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover thousands of products at unbeatable prices. Browse, compare, and buy with confidence.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg"
              >
                Get Started Now →
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition text-lg"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-6xl mb-3">🎁</div>
              <h3 className="font-bold text-gray-800 mb-2">Best Deals</h3>
              <p className="text-sm text-gray-600">Exclusive discounts every day</p>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-6xl mb-3">🚚</div>
              <h3 className="font-bold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick shipping to your door</p>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-6xl mb-3">✅</div>
              <h3 className="font-bold text-gray-800 mb-2">Verified Products</h3>
              <p className="text-sm text-gray-600">100% authentic items</p>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-6xl mb-3">💰</div>
              <h3 className="font-bold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600">Protected transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md py-16 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose ShopHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-8 border border-white border-opacity-30">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-white mb-3">Quality Assured</h3>
              <p className="text-blue-100">
                Every product is carefully selected and verified for quality. We guarantee your satisfaction with every purchase.
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-8 border border-white border-opacity-30">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-3">24/7 Support</h3>
              <p className="text-blue-100">
                Our dedicated customer support team is always ready to help. Chat with us anytime, anywhere.
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-8 border border-white border-opacity-30">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold text-white mb-3">Easy Returns</h3>
              <p className="text-blue-100">
                Not happy with your purchase? Get hassle-free returns within 30 days. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white bg-opacity-10 rounded-lg backdrop-blur-sm p-8 border border-white border-opacity-20">
            <div className="text-5xl font-bold text-yellow-300 mb-2">10K+</div>
            <p className="text-white text-lg">Products</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg backdrop-blur-sm p-8 border border-white border-opacity-20">
            <div className="text-5xl font-bold text-yellow-300 mb-2">50K+</div>
            <p className="text-white text-lg">Happy Customers</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg backdrop-blur-sm p-8 border border-white border-opacity-20">
            <div className="text-5xl font-bold text-yellow-300 mb-2">100K+</div>
            <p className="text-white text-lg">Orders Delivered</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg backdrop-blur-sm p-8 border border-white border-opacity-20">
            <div className="text-5xl font-bold text-yellow-300 mb-2">4.9⭐</div>
            <p className="text-white text-lg">Rating</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 py-16 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Shop?</h2>
          <p className="text-xl text-gray-700 mb-8">Join thousands of happy shoppers today</p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition text-lg"
          >
            Create Your Account Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 ShopHub. All rights reserved. | Secure Shopping Experience</p>
        </div>
      </footer>
    </div>
  )
}
