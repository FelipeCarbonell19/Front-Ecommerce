import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si se requiere autenticación y no hay usuario logueado
  if (requireAuth && !user) {
    // Guardar la ruta a la que quería acceder para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si hay roles específicos permitidos, verificar si el usuario tiene uno de ellos
  if (allowedRoles.length > 0 && user) {
    const hasAllowedRole = allowedRoles.includes(user.role)
    
    if (!hasAllowedRole) {
      // Redirigir al dashboard apropiado según su rol
      const redirectPath = getDashboardPath(user.role)
      return <Navigate to={redirectPath} replace />
    }
  }

  // Si todo está bien, renderizar el componente hijo
  return children
}

// Función helper para obtener la ruta del dashboard según el rol
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'seller':
      return '/seller/dashboard'
    case 'client':
      return '/dashboard'
    default:
      return '/login'
  }
}

export default ProtectedRoute