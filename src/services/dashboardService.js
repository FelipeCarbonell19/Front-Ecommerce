import { api } from './api.js'

/**
 * Servicio para obtener estadísticas del dashboard
 */
export const dashboardService = {
  
  /**
   * Obtener estadísticas generales del dashboard
   */
  getDashboardStats: async () => {
    try {
      // Hacer múltiples requests en paralelo para obtener todas las estadísticas
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/orders'),
        api.get('/api/admin/users')
      ]);

      // Procesar productos
      const products = productsRes?.data?.products || [];
      const totalProducts = products.length;

      // Procesar pedidos
      const orders = ordersRes?.data?.orders || [];
      const totalOrders = orders.length;
      
      // Calcular ventas del día (pedidos de hoy)
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at).toDateString();
        return orderDate === today;
      });
      
      const todaySales = todayOrders.reduce((total, order) => {
        return total + (parseFloat(order.total_amount) || 0);
      }, 0);

      // Procesar usuarios
      const users = usersRes?.data?.users || [];
      const totalUsers = users.length;

      return {
        success: true,
        stats: {
          todaySales,
          totalProducts,
          totalOrders,
          totalUsers,
          // Estadísticas adicionales
          todayOrdersCount: todayOrders.length,
          averageOrderValue: totalOrders > 0 ? (orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) / totalOrders) : 0
        }
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: 'Error obteniendo estadísticas del dashboard',
        stats: {
          todaySales: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalUsers: 0,
          todayOrdersCount: 0,
          averageOrderValue: 0
        }
      };
    }
  },

  /**
   * Formatear precio en pesos colombianos
   */
  formatPrice: (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  },

  /**
   * Formatear número con separadores
   */
  formatNumber: (number) => {
    return new Intl.NumberFormat('es-CO').format(number || 0);
  }
};