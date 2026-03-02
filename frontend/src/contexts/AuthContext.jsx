import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('access_token'))

//   useEffect(() => {
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`
//       api.get('/api/v1/users/me')
//         .then(res => setUser(res.data))
//         .catch(() => logout())
//     }
//   }, [token])
useEffect(() => {
  const token = localStorage.getItem("access_token")

  if (token) {
    // api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    api.get("/api/v1/users/me")
      .then(res => setUser(res.data))
      .catch(() => logout())
  }
}, [])

  async function login(data) {
  if (!data.access_token) return

  localStorage.setItem("access_token", data.access_token)

  // api.defaults.headers.common["Authorization"] =
  //   `Bearer ${data.access_token}`

  try {
    const res = await api.get("/api/v1/users/me")
    setUser(res.data)
  } catch {
    logout()
  }
}

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    // delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
