import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { productService } from "../../services/productService";

const ProductCard = ({ product, showActions = false, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity, isLoading } = useCart();

  // Función para manejar error de imagen
  const handleImageError = () => {
    setImageError(true);
  };

  // Función para agregar al carrito
  const handleAddToCart = async () => {
    const result = addToCart(product, 1);

    if (result.success) {
      // Mostrar notificación temporal
      showTemporaryNotification(result.message);
    }
  };

  // Función para mostrar notificación temporal
  const showTemporaryNotification = (message) => {
    // Crear elemento de notificación
    const notification = document.createElement("div");
    notification.className =
      "fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce";
    notification.textContent = `✅ ${message}`;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Eliminar después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    return productService.formatPrice(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={
            product.image_thumbnail ||
            product.image_url ||
            "https://placehold.co/250x192/e5e7eb/6b7280/png?text=Sin+Imagen"
          }
          alt={product.name}
          className="w-[250px] h-[192px] object-cover object-center rounded-lg bg-gray-100"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/250x192/e5e7eb/6b7280/png?text=Error";
          }}
        />

        {/* Badge de stock */}
        <div className="absolute top-2 right-2">
          {product.stock > 0 ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Stock: {product.stock}
            </span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Agotado
            </span>
          )}
        </div>

        {/* Badge de categoría */}
        {product.category_name && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.category_name}
            </span>
          </div>
        )}

        {/* Badge si está en el carrito */}
        {isInCart(product.id) && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              En carrito: {getItemQuantity(product.id)}
            </span>
          </div>
        )}
      </div>

      {/* Contenido del producto */}
      <div className="p-4">
        {/* Nombre del producto */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Descripción */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Precio */}
        <div className="items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          {/* Botón agregar al carrito (solo para clientes) */}
          {user?.role === "client" && product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`w-full font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isInCart(product.id)
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Agregando...
                </div>
              ) : isInCart(product.id) ? (
                `🛒 Agregar más (${getItemQuantity(product.id)})`
              ) : (
                "🛒 Agregar al Carrito"
              )}
            </button>
          )}

          {/* Mensaje para clientes si no hay stock */}
          {user?.role === "client" && product.stock === 0 && (
            <div className="w-full bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg text-center">
              😞 Sin stock disponible
            </div>
          )}

          {/* Acciones de admin/seller */}
          {showActions &&
            (user?.role === "admin" || user?.role === "seller") && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit && onEdit(product)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => onDelete && onDelete(product)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  🗑️ Eliminar
                </button>
              </div>
            )}

          {/* Botón ver detalles */}
          <button
            onClick={() => (window.location.href = `/products/${product.id}`)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            👁️ Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
