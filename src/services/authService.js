import { api, API_ENDPOINTS } from './api.js'

// Servicio de autenticación
export const authService = {
  
  // Login de usuario
  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      })

      if (response.success && response.data.success) {
        // Guardar datos en localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el login'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData)

      if (response.success && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Usuario registrado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error en el registro'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ME)

      if (response.success && response.data.success) {
        return {
          success: true,
          user: response.data.user
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener perfil'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Logout (limpia localStorage)
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return { success: true }
  },

  // Verificar si hay una sesión válida
  checkSession: () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        return {
          success: true,
          user,
          token
        }
      } catch (error) {
        // Si hay error parseando, limpiar localStorage
        authService.logout()
        return { success: false }
      }
    }
    
    return { success: false }
  },

  // Obtener token actual
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  }
}

export default authService