import { createContext, useContext, useState, useEffect } from 'react'

// Crear el contexto
const AuthContext = createContext()

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar si hay sesión guardada al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Si hay error, limpiar localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Función de login
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Guardar en localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Actualizar estado
        setUser(data.user)
        
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Error de conexión con el servidor' }
    }
  }

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Función para obtener el token
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user && user.role === role
  }

  // Función para verificar si el usuario puede acceder (admin o seller)
  const canManage = () => {
    return user && (user.role === 'admin' || user.role === 'seller')
  }

  // Valores que se proporcionan a los componentes hijos
  const value = {
    user,
    loading,
    login,
    logout,
    getToken,
    hasRole,
    canManage,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}