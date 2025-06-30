import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom"; // NUEVO: Importar useNavigate
import Header from "../../components/layout/Header";

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // NUEVO: Hook para navegación
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSummary,
    formatPrice,
    hasItems,
  } = useCart();

  const [notification, setNotification] = useState("");
  const summary = getCartSummary();

  // Función para mostrar notificaciones
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Función para actualizar cantidad
  const handleQuantityChange = (productId, newQuantity) => {
    const result = updateQuantity(productId, newQuantity);
    if (result.success) {
      showNotification(result.message);
    }
  };

  // Función para remover item
  const handleRemoveItem = (product) => {
    if (window.confirm(`¿Eliminar "${product.name}" del carrito?`)) {
      const result = removeFromCart(product.id);
      if (result.success) {
        showNotification(result.message);
      }
    }
  };

  // Función para limpiar carrito
  const handleClearCart = () => {
    if (window.confirm("¿Estás seguro de vaciar todo el carrito?")) {
      const result = clearCart();
      if (result.success) {
        showNotification(result.message);
      }
    }
  };

  // ARREGLO: Función para proceder al checkout
  const handleCheckout = () => {
    // Verificar que hay items antes de navegar
    if (!hasItems) {
      alert("No hay productos en el carrito");
      return;
    }
    
    // Usar navigate en lugar de window.location.href
    navigate("/checkout");
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                🛒 Mi Carrito de Compras
              </h1>
              <p className="text-orange-100 text-lg">
                {hasItems
                  ? `${summary.totalItems} producto${
                      summary.totalItems !== 1 ? "s" : ""
                    } en tu carrito`
                  : "Tu carrito está vacío"}
              </p>
            </div>
            {hasItems && (
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => navigate("/products")} // ARREGLO: Usar navigate
                  className="bg-white bg-opacity-20 text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  ← Seguir Comprando
                </button>
                <button
                  onClick={handleClearCart}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🗑️ Vaciar Carrito
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        {!hasItems ? (
          /* Carrito vacío */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <span className="text-8xl mb-6 block">🛒</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                ¡Descubre nuestros increíbles productos y comienza a comprar!
              </p>
              <button
                onClick={() => navigate("/products")} // ARREGLO: Usar navigate
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                🛍️ Explorar Productos
              </button>
            </div>
          </div>
        ) : (
          /* Carrito con productos */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Productos en tu carrito
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0 w-20 h-20 mr-4">
                        <img
                          src={
                            item.image_url ||
                            "https://placehold.co/80x80/e5e7eb/6b7280/png?text=Sin+Imagen"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/80x80/e5e7eb/6b7280/png?text=Error";
                          }}
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {item.description}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(item.price)} c/u
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            ➖
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ➕
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[6rem]">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Resumen del Pedido
                </h2>

                {/* Detalles del cálculo */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({summary.totalItems} productos):</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Envío:</span>
                    <span
                      className={
                        summary.freeShipping ? "text-green-600 font-medium" : ""
                      }
                    >
                      {summary.freeShipping
                        ? "GRATIS"
                        : formatPrice(summary.shipping)}
                    </span>
                  </div>

                  {summary.freeShipping && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700 text-sm">
                        🎉 ¡Tienes envío gratis por compras superiores a{" "}
                        {formatPrice(100000)}!
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>IVA (19%):</span>
                    <span>{formatPrice(summary.tax)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        {formatPrice(summary.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ARREGLO: Botón de checkout corregido */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  💳 Proceder al Pago
                </button>

                {/* Información adicional */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    🔒 Pago seguro con encriptación SSL
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📦 Entrega en 24-48 horas
                  </p>
                </div>

                {/* Métodos de pago aceptados */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    Métodos de pago aceptados:
                  </p>
                  <div className="flex justify-center space-x-2">
                    <span className="text-blue-600 text-sm font-medium">
                      💳 VISA
                    </span>
                    <span className="text-red-600 text-sm font-medium">
                      💳 MASTERCARD
                    </span>
                    <span className="text-blue-800 text-sm font-medium">
                      💳 AMEX
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;