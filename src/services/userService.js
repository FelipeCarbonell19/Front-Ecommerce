import { api } from './api.js'

/**
 * Servicios para gestión de usuarios (Solo Admin)
 */
export const userService = {
  
  /**
   * Obtener todos los usuarios del sistema
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users')
      
      if (response.success && response.data.success) {
        return {
          success: true,
          users: response.data.users || [],
          stats: response.data.stats || {}
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener usuarios',
          users: []
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        users: []
      }
    }
  },

  /**
   * Cambiar rol de un usuario
   */
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, { role: newRole })
      
      if (response.success && response.data.success) {
        return {
          success: true,
          user: response.data.user,
          message: response.data.message || 'Rol actualizado correctamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al cambiar rol'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  /**
   * Obtener estadísticas de usuarios
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/api/admin/users/stats')
      
      if (response.success && response.data.success) {
        return {
          success: true,
          stats: response.data.stats || {}
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener estadísticas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  }
};