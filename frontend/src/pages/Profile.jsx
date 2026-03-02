import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState(user || {})
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(user)
  }, [user])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/api/v1/users/me', form)
      setMessage('✅ Profile updated successfully')
      setMessageType('success')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Update failed')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  if (!user)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">👤 My Profile</h1>
        <p className="text-gray-600">Manage your account details</p>
      </div>

      <div className="max-w-2xl">
        {message && (
          <div className={`alert-${messageType} mb-6`}>
            <span>{messageType === 'success' ? '✔️' : '❌'}</span>
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Account Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  name="username"
                  value={form.username || ''}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                name="full_name"
                value={form.full_name || ''}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button
                type="button"
                onClick={logout}
                className="btn-danger flex-1"
              >
                🚪 Logout
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">🛑 Account Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Member Since</p>
              <p className="font-semibold">{new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Account Status</p>
              <p className="font-semibold text-green-600">{user?.is_active ? '✅ Active' : '⚠️ Inactive'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
