import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProductList from '../../components/products/ProductList'
import Header from '../../components/layout/Header'

const ProductsPage = () => {
  const { user } = useAuth()
  const [notification, setNotification] = useState('')

  // Función para agregar al carrito (temporal)
  const handleAddToCart = (product) => {
    // TODO: Implementar lógica real del carrito
    setNotification(`${product.name} agregado al carrito`)
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setNotification('')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Notificación flotante */}
      {notification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {notification}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header de la página */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              🛒 Catálogo de Productos
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Descubre nuestra amplia selección de productos de calidad
            </p>
            
            {/* Información según el rol del usuario */}
            {user ? (
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100">
                  Bienvenido, <span className="font-bold">{user.name}</span>
                  {user.role === 'client' && ' - Puedes agregar productos a tu carrito'}
                  {user.role === 'seller' && ' - Estos son todos los productos del sistema'}
                  {user.role === 'admin' && ' - Vista de administrador'}
                </p>
              </div>
            ) : (
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100">
                  <span className="font-medium">👋 ¡Hola visitante!</span> 
                  Explora nuestros productos. 
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="ml-2 underline hover:text-white transition-colors"
                  >
                    Inicia sesión para comprar
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">📦</div>
            <h3 className="text-lg font-medium text-gray-900">Productos</h3>
            <p className="text-gray-600">Amplio catálogo disponible</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">🚚</div>
            <h3 className="text-lg font-medium text-gray-900">Envío Rápido</h3>
            <p className="text-gray-600">Entrega en 24-48 horas</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">💳</div>
            <h3 className="text-lg font-medium text-gray-900">Pago Seguro</h3>
            <p className="text-gray-600">Transacciones protegidas</p>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ProductList 
            onAddToCart={user?.role === 'client' ? handleAddToCart : null}
            showActions={false} // Vista pública, sin acciones de edición
          />
        </div>

        {/* Call to action para usuarios no logueados */}
        {!user && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              ¿Quieres comprar algún producto?
            </h3>
            <p className="text-blue-700 mb-4">
              Inicia sesión o regístrate para agregar productos a tu carrito y realizar compras
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-3 px-6 rounded-lg border border-blue-600 transition-colors"
              >
                Registrarse
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductsPage