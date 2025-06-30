import { createContext, useContext, useState, useEffect } from 'react'

// Crear el contexto del carrito
const CartContext = createContext()

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

// Proveedor del contexto del carrito
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce_cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('ecommerce_cart')
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    setIsLoading(true)
    
    try {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id)
        
        if (existingItem) {
          // Si ya existe, aumentar cantidad
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Si no existe, agregar nuevo item
          return [...prevItems, { 
            ...product, 
            quantity,
            addedAt: new Date().toISOString()
          }]
        }
      })
      
      return { success: true, message: `${product.name} agregado al carrito` }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return { success: false, message: 'Error al agregar al carrito' }
    } finally {
      setTimeout(() => setIsLoading(false), 500) // Simular loading
    }
  }

  // Quitar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
    return { success: true, message: 'Producto eliminado del carrito' }
  }

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId)
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
    
    return { success: true, message: 'Cantidad actualizada' }
  }

  // Limpiar todo el carrito
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('ecommerce_cart')
    return { success: true, message: 'Carrito vaciado' }
  }

  // Obtener cantidad total de productos
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Obtener precio total
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Obtener subtotal por producto
  const getItemSubtotal = (item) => {
    return item.price * item.quantity
  }

  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId)
  }

  // Obtener cantidad de un producto específico
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // Formatear precio a pesos colombianos
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price)
  }

  // Obtener resumen del carrito
  const getCartSummary = () => {
    const totalItems = getTotalItems()
    const subtotal = getTotalPrice()
    const shipping = subtotal > 100000 ? 0 : 10.99 
    const tax = subtotal * 0.19 
    const total = subtotal + shipping + tax

    return {
      totalItems,
      subtotal,
      shipping,
      tax,
      total,
      hasItems: totalItems > 0,
      freeShipping: subtotal > 100000
    }
  }

  // Validar disponibilidad de stock antes del checkout
  const validateStock = () => {
    const outOfStock = cartItems.filter(item => item.quantity > item.stock)
    
    if (outOfStock.length > 0) {
      return {
        valid: false,
        message: `Sin stock suficiente para: ${outOfStock.map(item => item.name).join(', ')}`
      }
    }
    
    return { valid: true }
  }

  // Preparar datos para el pedido
  const prepareOrderData = () => {
    const summary = getCartSummary()
    
    return {
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: getItemSubtotal(item)
      })),
      summary,
      total_amount: summary.total
    }
  }

  // Valores que se proporcionan a los componentes hijos
  const value = {
    // Estado
    cartItems,
    isLoading,
    
    // Acciones
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Getters
    getTotalItems,
    getTotalPrice,
    getItemSubtotal,
    isInCart,
    getItemQuantity,
    getCartSummary,
    
    // Utilidades
    formatPrice,
    validateStock,
    prepareOrderData,
    
    // Estado calculado
    hasItems: cartItems.length > 0,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice()
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}