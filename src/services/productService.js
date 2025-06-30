import { api, API_ENDPOINTS } from './api.js'

// Servicio de productos
export const productService = {

  // Obtener todos los productos (público)
  getProducts: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS)

      if (response.success && response.data.success) {
        return {
          success: true,
          products: response.data.products || []
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener productos',
          products: []
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        products: []
      }
    }
  },

  // Obtener un producto por ID (público)
  getProductById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(id))

      if (response.success && response.data.success) {
        return {
          success: true,
          product: response.data.product
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Producto no encontrado'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Crear producto (admin/seller)
  createProduct: async (productData) => {
    try {
      const response = await api.post(API_ENDPOINTS.PRODUCTS, productData)

      if (response.success && response.data.success) {
        return {
          success: true,
          product: response.data.product,
          message: 'Producto creado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al crear producto'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Actualizar producto (admin/seller)
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(API_ENDPOINTS.PRODUCT_BY_ID(id), productData)

      if (response.success && response.data.success) {
        return {
          success: true,
          product: response.data.product,
          message: 'Producto actualizado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al actualizar producto'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.PRODUCT_BY_ID(id))

      // Caso exitoso
      if (response.success && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Producto eliminado exitosamente'
        }
      }
      // Caso de error 400 (producto con pedidos)
      else if (!response.success && response.status === 400) {
        return {
          success: false,
          message: response.data.message || 'No se puede eliminar el producto',
          hasOrders: response.data.hasOrders || false,
          ordersCount: response.data.ordersCount || 0
        }
      }
      // Otros errores del servidor
      else {
        return {
          success: false,
          message: response.data?.message || 'Error al eliminar producto'
        }
      }
    } catch (error) {
      console.error('Error eliminando producto:', error)
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  createProductWithImage: async (formData) => {
    try {
      const response = await api.postFile(API_ENDPOINTS.PRODUCTS, formData)

      if (response.success && response.data.success) {
        return {
          success: true,
          product: response.data.product,
          message: 'Producto creado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al crear producto'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Actualizar producto con imagen (admin/seller)
  updateProductWithImage: async (id, formData) => {
    try {
      const response = await api.putFile(API_ENDPOINTS.PRODUCT_BY_ID(id), formData)

      if (response.success && response.data.success) {
        return {
          success: true,
          product: response.data.product,
          message: 'Producto actualizado exitosamente'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al actualizar producto'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      }
    }
  },

  // Función helper para formatear precio
  formatPrice: (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price)
  },

  // Función helper para obtener imagen por defecto
  getDefaultImage: () => {
    return 'https://placehold.co/300x200/e5e7eb/6b7280/png?text=Sin+Imagen'
  }
}

export default productService