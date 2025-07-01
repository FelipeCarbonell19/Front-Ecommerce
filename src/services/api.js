const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


const getToken = () => {
  return localStorage.getItem('token')
}

const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: getAuthHeaders(),
    ...options
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return null
    }

    const data = await response.json()
    
    return {
      success: response.ok,
      data,
      status: response.status
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      success: false,
      error: error.message,
      status: 0
    }
  }
}

export const api = {
  get: (endpoint) => makeRequest(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => makeRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  put: (endpoint, data) => makeRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => makeRequest(endpoint, { method: 'DELETE' }),
  
  postFile: (endpoint, formData) => makeRequest(endpoint, {
    method: 'POST',
    headers: {
      ...(getToken() && { Authorization: `Bearer ${getToken()}` })
    },
    body: formData
  }),
  
  putFile: (endpoint, formData) => makeRequest(endpoint, {
    method: 'PUT',
    headers: {
      ...(getToken() && { Authorization: `Bearer ${getToken()}` })
    },
    body: formData
  })
}

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  ORDERS: '/api/orders',
  MY_ORDERS: '/api/orders/my-orders',
  ORDER_BY_ID: (id) => `/api/orders/${id}`,
  ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  
  // Nuevos endpoints de usuarios
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_ROLE: (id) => `/api/admin/users/${id}/role`,
  ADMIN_USER_STATS: '/api/admin/users/stats'
}

export default api