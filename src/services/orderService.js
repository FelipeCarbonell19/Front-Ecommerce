import api from './api';

/**
 * Servicio para manejar las operaciones de pedidos
 */
class OrderService {
  /**
   * Obtiene los pedidos del usuario actual (cliente)
   * @returns {Promise} - Promesa con la respuesta de la API
   */
  static async getMyOrders() {
    try {
      const response = await api.get('/api/orders/my-orders');

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('❌ Error en la respuesta:', response);
        return {
          success: false,
          message: response.data?.message || 'Error al obtener pedidos',
          data: { orders: [] }
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo mis pedidos:', error);
      return {
        success: false,
        message: 'Error de conexión',
        data: { orders: [] }
      };
    }
  }

  /**
   * Obtiene todos los pedidos (admin/seller)
   * @returns {Promise} - Promesa con la respuesta de la API
   */
  static async getAllOrders() {
    try {
      const response = await api.get('/api/orders');

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al obtener pedidos'
        };
      }
    } catch (error) {
      console.error('Error obteniendo todos los pedidos:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Obtiene un pedido específico por ID
   * @param {number} orderId - ID del pedido
   * @returns {Promise} - Promesa con la respuesta de la API
   */
  static async getOrderById(id) {
    try {

      const response = await api.get(`/api/orders/${id}`);


      if (response.success && response.data && response.data.data && response.data.data.order) {
        return {
          success: true,
          data: response.data.data 
        };
      } else {
        return {
          success: false,
          message: 'Estructura de respuesta incorrecta'
        };
      }
    } catch (error) {
      console.error('❌ OrderService error:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo pedido'
      };
    }
  }


  /**
   * Actualiza el estado de un pedido (admin/seller)
   * @param {number} orderId - ID del pedido
   * @param {string} newStatus - Nuevo estado (pending, shipped, delivered, cancelled)
   * @returns {Promise} - Promesa con la respuesta de la API
   */
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, {
        status: newStatus
      });

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error al actualizar estado'
        };
      }
    } catch (error) {
      console.error('Error actualizando estado del pedido:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Formatea el precio en pesos colombianos
   * @param {number} price - Precio a formatear
   * @returns {string} - Precio formateado
   */
  static formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  /**
   * Formatea la fecha
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} - Fecha formateada
   */
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene el color y texto para el estado del pedido
   * @param {string} status - Estado del pedido
   * @returns {object} - Objeto con color y texto
   */
  static getStatusInfo(status) {
    const statusMap = {
      pending: {
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        text: 'Pendiente',
        icon: '⏳'
      },
      shipped: {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        text: 'Enviado',
        icon: '🚚'
      },
      delivered: {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        text: 'Entregado',
        icon: '✅'
      },
      cancelled: {
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        text: 'Cancelado',
        icon: '❌'
      }
    };

    return statusMap[status] || statusMap.pending;
  }

  /**
   * Obtiene los estados válidos para transición
   * @param {string} currentStatus - Estado actual
   * @returns {Array} - Array de estados válidos
   */
  static getValidStatusTransitions(currentStatus) {
    const transitions = {
      pending: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], 
      cancelled: [] 
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Valida si el usuario puede cambiar el estado
   * @param {string} userRole - Rol del usuario
   * @param {string} currentStatus - Estado actual
   * @returns {boolean} - Si puede cambiar el estado
   */
  static canChangeStatus(userRole, currentStatus) {
    // Solo admin y seller pueden cambiar estados
    if (userRole !== 'admin' && userRole !== 'seller') {
      return false;
    }

    // No se pueden cambiar pedidos entregados o cancelados
    return currentStatus === 'pending' || currentStatus === 'shipped';
  }
}

export default OrderService;