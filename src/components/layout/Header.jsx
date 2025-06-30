import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const cartItemsCount = getTotalItems();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              🛒 Ecommerce
            </button>

            {user && (
              <div className="hidden md:flex ml-8 space-x-6">
                <button
                  onClick={() => navigate('/products')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🛍️ Productos
                </button>

                {user.role === 'client' && (
                  <>
                    <button
                      onClick={() => navigate('/cart')}
                      className="relative text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      🛒 Carrito
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {cartItemsCount > 99 ? '99+' : cartItemsCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/my-orders')}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      📋 Mis Pedidos
                    </button>
                  </>
                )}

                {(user.role === 'admin' || user.role === 'seller') && (
                  <>
                    <button
                      onClick={() => navigate('/admin/products')}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      📦 Gestionar Productos
                    </button>
                    <button
                      onClick={() => navigate('/orders')}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      📋 Gestionar Pedidos
                    </button>
                  </>
                )}

               {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    👥 Usuarios
                  </button>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user.role === 'admin' ? 'Administrador' : user.role === 'seller' ? 'Vendedor' : 'Cliente'}
                </span>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="md:hidden bg-gray-50 px-4 py-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/products')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1"
            >
              🛍️ Productos
            </button>
            {user.role === 'client' && (
              <>
                <button
                  onClick={() => navigate('/cart')}
                  className="relative text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1"
                >
                  🛒 Carrito
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/my-orders')}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1"
                >
                  📋 Mis Pedidos
                </button>
              </>
            )}

            {(user.role === 'admin' || user.role === 'seller') && (
              <>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1"
                >
                  📦 Gestionar Productos
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1"
                >
                  📋 Gestionar Pedidos
                </button>
              </>
            )}

            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1"
              >
                👥 Usuarios
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
