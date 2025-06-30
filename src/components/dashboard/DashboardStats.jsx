import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  /**
   * Cargar estadísticas al montar el componente
   */
  useEffect(() => {
    loadStats();
  }, []);

  /**
   * Obtener estadísticas del backend
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getDashboardStats();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        console.error('Error cargando estadísticas:', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Componente de tarjeta estadística
   */
  const StatCard = ({ title, value, icon, gradient, textColor, isPrice = false, isLoading = false }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white transform hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm`}>{title}</p>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-30 rounded w-20 mt-1"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold">
              {isPrice ? dashboardService.formatPrice(value) : dashboardService.formatNumber(value)}
            </p>
          )}
        </div>
        <div className="bg-white bg-opacity-30 rounded-full p-3">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Ventas Hoy"
        value={stats.todaySales}
        icon="💰"
        gradient="from-green-400 to-green-600"
        textColor="text-green-100"
        isPrice={true}
        isLoading={loading}
      />

      <StatCard
        title="Productos"
        value={stats.totalProducts}
        icon="📦"
        gradient="from-blue-400 to-blue-600"
        textColor="text-blue-100"
        isLoading={loading}
      />

      <StatCard
        title="Pedidos"
        value={stats.totalOrders}
        icon="🛒"
        gradient="from-purple-400 to-purple-600"
        textColor="text-purple-100"
        isLoading={loading}
      />

      <StatCard
        title="Usuarios"
        value={stats.totalUsers}
        icon="👥"
        gradient="from-orange-400 to-red-500"
        textColor="text-orange-100"
        isLoading={loading}
      />
    </div>
  );
};

export default DashboardStats;