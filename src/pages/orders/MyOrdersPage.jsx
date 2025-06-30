import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import OrderService from "../../services/orderService";
import Swal from "sweetalert2";

const MyOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyOrders();
  }, []);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      const result = await OrderService.getMyOrders();

      if (result.success) {
        setOrders(result.data.orders || []);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setError("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const downloadReceipt = async (orderId, receiptUrl) => {
    try {
      if (!receiptUrl) {
        Swal.fire({
          title: "⚠️ Comprobante No Disponible",
          text: "Este pedido no tiene comprobante PDF disponible",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
        });
        return;
      }

      Swal.fire({
        title: "📄 Descargando...",
        text: "Preparando tu comprobante PDF",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading(),
      });

      const pdfUrl = `http://localhost:5000${receiptUrl}`;

      const response = await fetch(pdfUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `comprobante_pedido_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          title: "✅ Descarga Exitosa",
          text: "Tu comprobante se ha descargado correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Archivo no encontrado");
      }
    } catch (error) {
      console.error("Error descargando PDF:", error);

      Swal.fire({
        title: "❌ Error de Descarga",
        text: "No se pudo descargar el comprobante. Inténtalo más tarde.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus pedidos...</p>
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📋 Mis Pedidos</h1>
              <p className="text-blue-100 text-lg">
                Revisa el estado de tus compras
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate("/products")}
                className="bg-white bg-opacity-20 text-white font-medium py-2 px-6 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                🛍️ Seguir Comprando
              </button>
            </div>
          </div>
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
                No tienes pedidos aún
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                ¡Explora nuestros productos y realiza tu primera compra!
              </p>
              <button
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                🛍️ Ver Productos
              </button>
            </div>
          </div>
        ) : (
          /* Lista de pedidos */
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = OrderService.getStatusInfo(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header del pedido */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Pedido #{order.id}
                        </h3>
                        <p className="text-gray-600">
                          {OrderService.formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="mt-3 md:mt-0 flex items-center space-x-4">
                        {/* Estado */}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border`}
                        >
                          {statusInfo.icon} {statusInfo.text}
                        </span>

                        {/* Total */}
                        <span className="text-2xl font-bold text-green-600">
                          {OrderService.formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Información de envío */}
                    {(order.shipping_full_name || order.shipping_address) && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          📦 Información de Envío
                        </h4>
                        <div className="text-sm text-gray-600">
                          {order.shipping_full_name && (
                            <p>
                              <strong>Nombre:</strong>{" "}
                              {order.shipping_full_name}
                            </p>
                          )}
                          {order.shipping_address && (
                            <p>
                              <strong>Dirección:</strong>{" "}
                              {order.shipping_address}, {order.shipping_city}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Información de pago */}
                    {order.payment_card_masked && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          💳 Método de Pago
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.payment_card_type} {order.payment_card_masked}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        👁️ Ver Detalles
                      </button>

                      {order.status === "delivered" && (
                        <button
                          onClick={() => navigate("/products")}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          🔄 Volver a Comprar
                        </button>
                      )}

                      {order.receipt_url && (
                        <button
                          onClick={() =>
                            downloadReceipt(order.id, order.receipt_url)
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                          <span>📄 Descargar Comprobante</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrdersPage;
