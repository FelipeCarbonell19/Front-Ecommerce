import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import OrderService from '../../services/orderService';

const ManageOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // Cargar todos los pedidos al montar el componente
  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    try {
      setLoading(true);
      const result = await OrderService.getAllOrders();
      
      if (result.success) {
        setOrders(result.data.orders || []);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const result = await OrderService.updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        // Actualizar el pedido en la lista
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        // Mostrar notificación de éxito
        showNotification(`Pedido #${orderId} actualizado a ${newStatus}`, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showNotification('Error al actualizar el pedido', 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const showNotification = (message, type = 'info') => {
    // Implementación simple de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const statusInfo = OrderService.getStatusInfo(status);
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  const getStatusOptions = (currentStatus) => {
    const validTransitions = OrderService.getValidStatusTransitions(currentStatus);
    return validTransitions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🔧 Gestión de Pedidos</h1>
              <p className="text-purple-100 text-lg">
                Administra todos los pedidos del sistema
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={loadAllOrders}
                className="bg-white bg-opacity-20 text-white font-medium py-2 px-6 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {['pending', 'shipped', 'delivered', 'cancelled'].map(status => {
            const count = orders.filter(order => order.status === status).length;
            const statusInfo = OrderService.getStatusInfo(status);
            
            return (
              <div key={status} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${statusInfo.bgColor}`}>
                    <span className="text-2xl">{statusInfo.icon}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{statusInfo.text}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contenido */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          /* Sin pedidos */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <span className="text-8xl mb-6 block">📦</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                No hay pedidos en el sistema
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Los pedidos aparecerán aquí cuando los clientes realicen compras.
              </p>
            </div>
          </div>
        ) : (
          /* Lista de pedidos */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Todos los Pedidos ({orders.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.user_name}</div>
                        <div className="text-sm text-gray-500">{order.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {OrderService.formatPrice(order.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {OrderService.formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁️ Ver
                        </button>
                        
                        {OrderService.canChangeStatus(user.role, order.status) && (
                          <div className="inline-block relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingOrder === order.id}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={order.status}>
                                {OrderService.getStatusInfo(order.status).text}
                              </option>
                              {getStatusOptions(order.status).map(status => (
                                <option key={status} value={status}>
                                  Cambiar a {OrderService.getStatusInfo(status).text}
                                </option>
                              ))}
                            </select>
                            {updatingOrder === order.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageOrdersPage;