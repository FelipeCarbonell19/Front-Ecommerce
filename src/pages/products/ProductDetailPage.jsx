import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import Header from '../../components/layout/Header';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  /**
   * Cargar producto al montar componente
   */
  useEffect(() => {
    loadProduct();
  }, [id]);

  /**
   * Obtener detalles del producto
   */
  const loadProduct = async () => {
    try {
      setLoading(true);
      const result = await productService.getProductById(id);
      
      if (result.success) {
        setProduct(result.product);
      } else {
        setError(result.message || 'Producto no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agregar al carrito
   */
  const handleAddToCart = () => {
    const result = addToCart(product, quantity);
    
    if (result.success) {
      showNotification(`✅ ${quantity} producto(s) agregado(s) al carrito`);
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  };

  /**
   * Actualizar cantidad en carrito
   */
  const handleUpdateCartQuantity = (newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(product.id);
      showNotification('Producto removido del carrito');
    } else {
      updateQuantity(product.id, newQuantity);
      showNotification(`Cantidad actualizada: ${newQuantity}`);
    }
  };

  /**
   * Mostrar notificación temporal
   */
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    return productService.formatPrice(price);
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <span className="text-8xl mb-4 block">😞</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              ← Volver a productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = [
    product.image_url,
    product.image_thumbnail,
    product.image_url // Duplicamos para simular múltiples imágenes
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600">
                Inicio
              </button>
            </li>
            <li>→</li>
            <li>
              <button onClick={() => navigate('/products')} className="hover:text-blue-600">
                Productos
              </button>
            </li>
            <li>→</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={images[activeImage] || productService.getDefaultImage()}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = productService.getDefaultImage();
                }}
              />
            </div>
            
            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      activeImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.category_name && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category_name}
                  </span>
                )}
              </div>
              
              {product.created_by_name && (
                <p className="text-gray-600">Vendido por: <span className="font-medium">{product.created_by_name}</span></p>
              )}
            </div>

            {/* Precio */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `✅ En stock (${product.stock})` : '❌ Agotado'}
                </span>
              </div>
            </div>

            {/* Descripción */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Acciones para clientes */}
            {user?.role === 'client' && (
              <div className="space-y-4 border-t pt-6">
                
                {product.stock > 0 ? (
                  <>
                    {/* Selector de cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                      >
                        🛒 Agregar al carrito
                      </button>
                      
                      {isInCart(product.id) && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-orange-800 font-medium">
                              En tu carrito: {getItemQuantity(product.id)} unidad(es)
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateCartQuantity(getItemQuantity(product.id) - 1)}
                              className="flex-1 bg-orange-200 hover:bg-orange-300 text-orange-800 font-medium py-2 px-4 rounded-lg"
                            >
                              Quitar 1
                            </button>
                            <button
                              onClick={() => handleUpdateCartQuantity(getItemQuantity(product.id) + 1)}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg"
                            >
                              Agregar 1
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <span className="text-red-800 font-medium">😞 Producto agotado</span>
                  </div>
                )}
              </div>
            )}

            {/* Info adicional */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p><strong>SKU:</strong> #{product.id}</p>
              {product.created_at && (
                <p><strong>Publicado:</strong> {new Date(product.created_at).toLocaleDateString('es-CO')}</p>
              )}
              {product.updated_at && (
                <p><strong>Actualizado:</strong> {new Date(product.updated_at).toLocaleDateString('es-CO')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;