import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProductList from '../../components/products/ProductList'
import ProductForm from '../../components/products/ProductForm'
import Header from '../../components/layout/Header'
import { productService } from '../../services/productService'
import Swal from 'sweetalert2'

const ManageProductsPage = () => {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [notification, setNotification] = useState('')
  const [refreshList, setRefreshList] = useState(0)

  // Verificar permisos
  if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para gestionar productos</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(''), 4000)
  }

  // Función para crear nuevo producto
  const handleCreateProduct = () => {
    console.log('Creating new product...') // DEBUG
    setEditingProduct(null)
    setShowForm(true)
  }

  // Función para editar producto
  const handleEditProduct = (product) => {
    console.log('Editing product:', product) // DEBUG
    setEditingProduct(product)
    setShowForm(true)
  }

  // ⭐ FUNCIÓN MEJORADA: Eliminar producto con SweetAlert2
  const handleDeleteProduct = async (product) => {
    try {
      // Mostrar confirmación inicial
      const confirmResult = await Swal.fire({
        title: '¿Eliminar producto?',
        html: `
          <div class="text-left">
            <p><strong>Producto:</strong> ${product.name}</p>
            <p class="text-sm text-gray-600 mt-2">Se verificará si el producto tiene pedidos activos.</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Verificar y eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (!confirmResult.isConfirmed) {
        return; // Usuario canceló
      }

      // Mostrar loading mientras se verifica
      Swal.fire({
        title: 'Verificando...',
        text: 'Comprobando si el producto tiene pedidos',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Intentar eliminar y ver el resultado
      const result = await productService.deleteProduct(product.id);

      if (result.success) {
        // ✅ ELIMINACIÓN EXITOSA
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: `Producto "${product.name}" eliminado exitosamente`,
          timer: 2500,
          showConfirmButton: false
        });
        
        setRefreshList(prev => prev + 1); // Refresh list
        
      } else if (result.hasOrders || result.cannotDelete) {
        // ⚠️ PRODUCTO CON PEDIDOS - NO SE PUEDE ELIMINAR
        Swal.fire({
          icon: 'warning',
          title: '⚠️ No se puede eliminar',
          html: `
            <div class="text-left">
              <p><strong>Producto:</strong> ${product.name}</p>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p class="text-yellow-800 font-medium">⚠️ Este producto tiene ${result.ordersCount || 'algunos'} pedido(s) activo(s)</p>
                <p class="text-yellow-700 text-sm mt-2">No se puede eliminar porque está incluido en pedidos existentes.</p>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p class="text-blue-800 font-medium">💡 Alternativas:</p>
                <ul class="text-blue-700 text-sm mt-2 list-disc list-inside">
                  <li>Editar el producto para marcarlo como "No disponible"</li>
                  <li>Reducir el stock a 0</li>
                  <li>Cambiar la descripción indicando que está descontinuado</li>
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3b82f6',
          footer: '<button onclick="editProduct()" class="text-blue-600 hover:text-blue-800">✏️ Editar este producto</button>',
          didRender: () => {
            // Agregar funcionalidad al botón de editar
            window.editProduct = () => {
              Swal.close();
              handleEditProduct(product);
            };
          }
        });
        
      } else {
        // ❌ OTROS ERRORES
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al eliminar el producto'
        });
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor'
      });
    }
  };

  // ⭐ FUNCIÓN CLAVE: Guardar producto (crear o editar)
  const handleSaveProduct = async (productData) => {
    console.log('handleSaveProduct called with:', productData) // DEBUG
    
    try {
      let result
      
      if (editingProduct) {
        // Actualizar producto existente
        console.log('Updating product with ID:', editingProduct.id) // DEBUG
        result = await productService.updateProduct(editingProduct.id, productData)
      } else {
        // Crear nuevo producto
        console.log('Creating new product...') // DEBUG
        result = await productService.createProduct(productData)
      }

      console.log('Service result:', result) // DEBUG

      if (result.success) {
        showNotification(result.message || 'Producto guardado exitosamente')
        setShowForm(false)
        setEditingProduct(null)
        setRefreshList(prev => prev + 1) // Trigger refresh
      } else {
        showNotification(result.message || 'Error al guardar producto', 'error')
      }
    } catch (error) {
      console.error('Save error:', error)
      showNotification('Error al guardar el producto', 'error')
    }
  }

  // Función para cancelar formulario
  const handleCancelForm = () => {
    console.log('Form cancelled') // DEBUG
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Notificación flotante */}
      {notification && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'error' ? '❌' : '✅'}
            </span>
            {notification.message}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header de la página */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                ⚙️ Gestión de Productos
              </h1>
              <p className="text-purple-100 text-lg">
                {user.role === 'admin' ? 'Administra todos los productos del sistema' : 'Gestiona tus productos'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleCreateProduct}
                className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                ➕ Crear Nuevo Producto
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-gray-600">Total Productos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-gray-600">En Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-gray-600">Sin Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <span className="text-2xl">🏷️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-gray-600">Categorías</p>
              </div>
            </div>
          </div>
        </div>

        {/* ⭐ MODAL/FORMULARIO DE PRODUCTO - PARTE CRÍTICA */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}
                </h2>
              </div>
              <div className="p-6">
                <ProductForm
                  product={editingProduct}
                  onSave={handleSaveProduct}
                  onCancel={handleCancelForm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de productos con acciones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ProductList
            key={refreshList} // Force re-render when refreshList changes
            showActions={true}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>
      </main>
    </div>
  )
}

export default ManageProductsPage