import React from 'react';
import DashboardStats from './DashboardStats';

// Dashboard Admin (con estadísticas dinámicas)
export const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Dashboard Administrador</h1>
        <p className="text-blue-100">Gestiona todo tu ecommerce desde aquí</p>
      </div>

      {/* Estadísticas dinámicas */}
      <DashboardStats />

      {/* Módulos principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <span className="text-3xl">📦</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Productos</h3>
                <p className="text-blue-100">Gestiona tu catálogo</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Administra productos, categorías, stock y precios de manera eficiente.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Crear productos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Editar información</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Control de stock</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Gestionar Productos →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <span className="text-3xl">🛒</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Pedidos</h3>
                <p className="text-green-100">Gestiona las ventas</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Supervisa pedidos, estados de entrega y procesa las transacciones.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Ver todos los pedidos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Cambiar estados</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Gestionar entregas</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Gestionar Pedidos →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Usuarios</h3>
                <p className="text-purple-100">Administra roles</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Controla usuarios, asigna roles y gestiona permisos del sistema.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Gestionar usuarios</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Asignar roles</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">✅ Control de acceso</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Gestionar Usuarios →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Seller
export const SellerDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Vendedor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Mis Productos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona tu catálogo de productos
            </p>
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Ver Productos
            </button>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Pedidos Recibidos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona los pedidos de tus productos
            </p>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Ver Pedidos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Cliente
export const ClientDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Cuenta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Explorar Productos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Descubre nuestro catálogo de productos
            </p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Ver Productos
            </button>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Mis Pedidos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Revisa el estado de tus pedidos
            </p>
            <button 
              onClick={() => window.location.href = '/my-orders'}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Ver Mis Pedidos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}