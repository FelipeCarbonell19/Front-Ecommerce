import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";
import OrderService from "../../services/orderService";
import Swal from "sweetalert2";

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const result = await OrderService.getOrderById(id);

      if (result.success) {
        setOrder(result.data.order);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error cargando detalle del pedido:", error);
      setError("Error al cargar el detalle del pedido");
    } finally {
      setLoading(false);
    }
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

      const pdfUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${receiptUrl}`;

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

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const result = await OrderService.updateOrderStatus(id, newStatus);

      if (result.success) {
        setOrder((prev) => ({ ...prev, status: newStatus }));
        showNotification(`Pedido actualizado a ${newStatus}`, "success");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      showNotification("Error al actualizar el pedido", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const canUserAccessOrder = () => {
    if (!order || !user) return false;

    // Admin y seller pueden ver todos los pedidos
    if (user.role === "admin" || user.role === "seller") return true;

    // Cliente solo puede ver sus propios pedidos
    return user.id === order.user_id;
  };

  const canChangeStatus = () => {
    return OrderService.canChangeStatus(user.role, order?.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalle del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <span className="text-8xl mb-6 block">❌</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pedido no encontrado
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              {error ||
                "El pedido que buscas no existe o no tienes permisos para verlo."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canUserAccessOrder()) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <span className="text-8xl mb-6 block">🔒</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              No tienes permisos para ver este pedido.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              ← Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = OrderService.getStatusInfo(order.status);
  const validTransitions = OrderService.getValidStatusTransitions(order.status);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del pedido */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pedido #{order.id}
              </h1>
              <p className="text-gray-600">
                Realizado el {OrderService.formatDate(order.created_at)}
              </p>
              {(user.role === "admin" || user.role === "seller") && (
                <p className="text-gray-600">
                  Cliente: {order.user_name} ({order.user_email})
                </p>
              )}
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span
                className={`px-4 py-2 rounded-full text-lg font-medium ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border`}
              >
                {statusInfo.icon} {statusInfo.text}
              </span>

              {order.receipt_url && (
                <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  PDF Disponible
                </span>
              )}

              <button
                onClick={() => navigate(-1)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Volver
              </button>
            </div>
          </div>

          {/* Cambio de estado (solo admin/seller) */}
          {canChangeStatus() && validTransitions.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Cambiar Estado
              </h3>
              <div className="flex space-x-3">
                {validTransitions.map((status) => {
                  const nextStatusInfo = OrderService.getStatusInfo(status);
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updatingStatus}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${nextStatusInfo.bgColor} ${nextStatusInfo.textColor} hover:opacity-80`}
                    >
                      {updatingStatus ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Actualizando...
                        </div>
                      ) : (
                        `${nextStatusInfo.icon} Marcar como ${nextStatusInfo.text}`
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productos del pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Productos
              </h2>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-16 h-16 mr-4">
                        <img
                          src={
                            item.image_url ||
                            "https://placehold.co/64x64/e5e7eb/6b7280/png?text=Sin+Imagen"
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity} ×{" "}
                          {OrderService.formatPrice(item.unit_price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {OrderService.formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No hay información de productos disponible.
                </p>
              )}
            </div>
          </div>

          {/* Información del pedido */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resumen del pedido */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{OrderService.formatPrice(order.total_amount)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {OrderService.formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de envío */}
            {order.shipping_info && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  📦 Información de Envío
                </h3>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Nombre:</strong> {order.shipping_info.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.shipping_info.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {order.shipping_info.phone}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {order.shipping_info.address}
                  </p>
                  <p>
                    <strong>Ciudad:</strong> {order.shipping_info.city}
                  </p>
                  <p>
                    <strong>Código Postal:</strong>{" "}
                    {order.shipping_info.zip_code}
                  </p>
                  {order.shipping_info.notes && (
                    <p>
                      <strong>Notas:</strong> {order.shipping_info.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Información de pago */}
            {order.payment_info && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  💳 Información de Pago
                </h3>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Método:</strong> {order.payment_info.card_type}
                  </p>
                  <p>
                    <strong>Tarjeta:</strong>{" "}
                    {order.payment_info.card_last_four}
                  </p>
                  {order.payment_info.transaction_id && (
                    <p>
                      <strong>ID Transacción:</strong>{" "}
                      {order.payment_info.transaction_id}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Acciones adicionales */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                {order.receipt_url && (
                  <button
                    onClick={() => downloadReceipt(order.id, order.receipt_url)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
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

                {user.role === "client" && order.status === "delivered" && (
                  <button
                    onClick={() => navigate("/products")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🔄 Volver a Comprar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
