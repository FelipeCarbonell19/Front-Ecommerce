import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom"; 
import Header from "../../components/layout/Header";
import Swal from "sweetalert2";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const {
    cartItems,
    getCartSummary,
    formatPrice,
    hasItems,
    clearCart,
    validateStock,
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); 

  // Estados del formulario
  const [shippingData, setShippingData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    cardType: "",
  });

  const [paymentFile, setPaymentFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [paymentResult, setPaymentResult] = useState(null);

  const summary = getCartSummary();

  useEffect(() => {
    if (!hasItems && !orderCreated) {
      setIsRedirecting(true);

      Swal.fire({
        title: "🛒 Carrito Vacío",
        text: "No hay productos en el carrito. Te redirigiremos para que agregues productos.",
        icon: "info",
        confirmButtonColor: "#1e40af",
        confirmButtonText: "🛍️ Ir al Catálogo",
      }).then(() => {
        navigate("/products");
      });
    }
  }, [hasItems, orderCreated, navigate]);

  // Tarjetas de prueba válidas
  const testCards = {
    4111111111111111: { type: "VISA", result: "approved" },
    5555555555554444: { type: "MASTERCARD", result: "approved" },
    3782822463100050: { type: "AMEX", result: "approved" },
    4000000000000002: { type: "VISA", result: "declined" },
    5555555555554445: { type: "MASTERCARD", result: "declined" },
  };

  // ARREGLO: No renderizar nada si está redirigiendo o no hay items
  if (isRedirecting || (!hasItems && !orderCreated)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al carrito...</p>
        </div>
      </div>
    );
  }

  // Manejar cambios en shipping
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en payment
  const handlePaymentChange = (e) => {
    let { name, value } = e.target;

    // Formatear número de tarjeta
    if (name === "cardNumber") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim();
      if (value.length <= 19) {
        setPaymentData((prev) => ({ ...prev, [name]: value }));

        // Detectar tipo de tarjeta
        const cleanNumber = value.replace(/\s/g, "");
        if (cleanNumber.startsWith("4")) {
          setPaymentData((prev) => ({ ...prev, cardType: "VISA" }));
        } else if (cleanNumber.startsWith("5")) {
          setPaymentData((prev) => ({ ...prev, cardType: "MASTERCARD" }));
        } else if (cleanNumber.startsWith("3")) {
          setPaymentData((prev) => ({ ...prev, cardType: "AMEX" }));
        } else {
          setPaymentData((prev) => ({ ...prev, cardType: "" }));
        }
      }
    }
    // Formatear fecha de expiración
    else if (name === "expiryDate") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{1,2})/, "$1/$2")
        .substr(0, 5);
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }
    // Formatear CVV
    else if (name === "cvv") {
      value = value.replace(/\D/g, "").substr(0, 4);
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validar shipping
  const validateShipping = () => {
    const newErrors = {};
    if (!shippingData.fullName.trim())
      newErrors.fullName = "Nombre completo requerido";
    if (!shippingData.email.trim()) newErrors.email = "Email requerido";
    if (!shippingData.phone.trim()) newErrors.phone = "Teléfono requerido";
    if (!shippingData.address.trim()) newErrors.address = "Dirección requerida";
    if (!shippingData.city.trim()) newErrors.city = "Ciudad requerida";
    if (!shippingData.zipCode.trim())
      newErrors.zipCode = "Código postal requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar payment
  const validatePayment = () => {
    const newErrors = {};
    const cleanNumber = paymentData.cardNumber.replace(/\s/g, "");

    if (!paymentData.cardNumber.trim()) {
      newErrors.cardNumber = "Número de tarjeta requerido";
    } else if (cleanNumber.length < 15) {
      newErrors.cardNumber = "Número de tarjeta inválido";
    }

    if (!paymentData.expiryDate.trim()) {
      newErrors.expiryDate = "Fecha de expiración requerida";
    } else {
      const [month, year] = paymentData.expiryDate.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (
        !month ||
        !year ||
        month < 1 ||
        month > 12 ||
        year < currentYear ||
        (year == currentYear && month < currentMonth)
      ) {
        newErrors.expiryDate = "Fecha de expiración inválida";
      }
    }

    if (!paymentData.cvv.trim()) {
      newErrors.cvv = "CVV requerido";
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    if (!paymentData.cardName.trim()) {
      newErrors.cardName = "Nombre del titular requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simular procesamiento de pago
    const processPayment = async () => {
        try {
            const confirmResult = await Swal.fire({
                title: '💳 Confirmar Pago',
                html: `
          <div class="text-left space-y-3">
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-lg font-bold text-blue-900">💰 Total: ${formatPrice(summary.total)}</p>
            </div>
            <p><strong>💳 Tarjeta:</strong> ${paymentData.cardType} ****${paymentData.cardNumber.slice(-4)}</p>
            <p><strong>📦 Envío a:</strong> ${shippingData.fullName}</p>
            <p><strong>📍 Dirección:</strong> ${shippingData.address}, ${shippingData.city}</p>
            <hr class="my-3">
            <p class="text-sm text-gray-600">¿Confirmas que deseas proceder con el pago?</p>
          </div>
        `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#1e40af',
                cancelButtonColor: '#dc2626',
                confirmButtonText: '💳 Sí, Pagar Ahora',
                cancelButtonText: '❌ Cancelar',
                customClass: {
                    popup: 'rounded-lg',
                    htmlContainer: 'text-sm'
                }
            });

            if (!confirmResult.isConfirmed) {
                return; 
            }

            // PASO 2: Mostrar loading
            Swal.fire({
                title: '⏳ Procesando Pago...',
                html: `
          <div class="text-center">
            <div class="animate-spin inline-block w-12 h-12 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-4"></div>
            <p class="text-lg mb-2">Conectando con el banco...</p>
            <p class="text-sm text-gray-600">Por favor no cierres esta ventana</p>
            <div class="mt-4 text-xs text-gray-500 space-y-1">
              <p>🔒 Transacción 100% segura</p>
              <p>⏱️ Esto puede tomar unos segundos</p>
            </div>
          </div>
        `,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false
            });

            // PASO 3: Simular procesamiento
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const cleanNumber = paymentData.cardNumber.replace(/\s/g, "");
            const cardInfo = testCards[cleanNumber];

            let result;
            if (cardInfo) {
                result = {
                    success: cardInfo.result === "approved",
                    message:
                        cardInfo.result === "approved"
                            ? `Pago aprobado con tarjeta ${cardInfo.type}`
                            : `Pago rechazado - Fondos insuficientes`,
                    transactionId: `TXN-${Date.now()}`,
                    cardType: cardInfo.type,
                };
            } else {
                result = {
                    success: false,
                    message: "Tarjeta no válida para demo",
                    transactionId: null,
                    cardType: paymentData.cardType,
                };
            }

            setPaymentResult(result);

            // PASO 4: Mostrar resultado
            if (result.success) {
                // ✅ PAGO EXITOSO
                await Swal.fire({
                    title: '✅ Pago Aprobado',
                    html: `
            <div class="text-center">
              <div class="text-green-500 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-lg text-green-600 mb-2">${result.message}</p>
              <p class="text-sm text-gray-600">ID: ${result.transactionId}</p>
              <p class="text-sm text-gray-600 mt-3">Ahora crearemos tu pedido...</p>
            </div>
          `,
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: '📦 Crear Pedido',
                    timer: 3000,
                    timerProgressBar: true
                });

                setCurrentStep(3);
            } else {
                // ❌ PAGO RECHAZADO
                await Swal.fire({
                    title: '❌ Pago Rechazado',
                    html: `
            <div class="text-center">
              <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-lg text-red-600 mb-4">${result.message}</p>
              <div class="text-sm text-gray-600 text-left bg-gray-50 p-3 rounded">
                <p class="mb-2"><strong>Posibles causas:</strong></p>
                <ul class="list-disc list-inside space-y-1">
                  <li>Fondos insuficientes</li>
                  <li>Tarjeta expirada o bloqueada</li>
                  <li>Datos incorrectos</li>
                </ul>
              </div>
            </div>
          `,
                    icon: 'error',
                    confirmButtonColor: '#dc2626',
                    confirmButtonText: '🔄 Intentar de Nuevo'
                });

                setCurrentStep(3);
            }

        } catch (error) {
            console.error('Error procesando pago:', error);

            await Swal.fire({
                title: '❌ Error Inesperado',
                text: 'Ocurrió un error procesando el pago. Por favor intenta nuevamente.',
                icon: 'error',
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Entendido'
            });
        }
    };

  // Crear pedido en backend
    const createOrder = async () => {
        setLoading(true);

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                shipping_data: {  // 🔥 CORRECTO: shipping_data como espera el backend
                    fullName: shippingData.fullName,
                    email: shippingData.email,
                    phone: shippingData.phone,
                    address: shippingData.address,
                    city: shippingData.city,
                    zipCode: shippingData.zipCode,
                    notes: shippingData.notes
                },
                payment_data: {   // 🔥 CORRECTO: payment_data como espera el backend
                    transaction_id: paymentResult.transactionId,
                    card_type: paymentResult.cardType,
                    card_number: paymentData.cardNumber.replace(/\s/g, '')
                }
            };

            console.log('📤 Enviando pedido:', orderData);

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            console.log('📥 Respuesta del servidor:', result);

            if (result.success) {
                // 🔥 PEDIDO EXITOSO CON OPCIÓN DE PDF
                const successResult = await Swal.fire({
                    title: '🎉 ¡Pedido Creado!',
                    html: `
            <div class="text-center">
              <div class="text-green-500 mb-4">
                <svg class="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-xl font-bold text-green-600 mb-3">¡Compra Exitosa!</p>
              <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <p class="text-lg font-bold">Pedido #${result.order.id}</p>
                <p class="text-2xl font-bold text-green-600">${formatPrice(result.order.total_amount)}</p>
              </div>
              <p class="text-sm text-gray-600 mb-2">✅ Recibirás un email con los detalles</p>
              <p class="text-sm text-gray-600">📦 Tu pedido será procesado pronto</p>
              ${result.receipt_url ? '<p class="text-sm text-blue-600 mt-3">📄 Comprobante PDF disponible</p>' : ''}
            </div>
          `,
                    icon: 'success',
                    showCancelButton: result.receipt_url ? true : false,
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#1e40af',
                    confirmButtonText: '📋 Ver Mis Pedidos',
                    cancelButtonText: result.receipt_url ? '📄 Descargar Comprobante' : ''
                });

                // Manejar descarga de PDF
                if (successResult.isDismissed && successResult.dismiss === Swal.DismissReason.cancel) {
                    await downloadReceipt(result.order.id);
                }

                clearCart();
                setOrderCreated(true);
                setCurrentStep(4);

                // Redirigir después de un momento
                setTimeout(() => {
                    navigate('/my-orders');
                }, 2000);

            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Error creando pedido:', error);

            await Swal.fire({
                title: '❌ Error Creando Pedido',
                html: `
          <p class="text-red-600 mb-4">No se pudo crear el pedido:</p>
          <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">${error.message}</p>
          <p class="text-sm text-gray-600 mt-4">Por favor intenta nuevamente o contacta soporte.</p>
        `,
                icon: 'error',
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Intentar Nuevamente'
            });
        } finally {
            setLoading(false);
        }
    };

const downloadReceipt = async (orderId) => {
  try {
    Swal.fire({
      title: '📄 Descargando Comprobante...',
      text: 'Preparando tu PDF',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => Swal.showLoading()
    });

    // ⭐ ARREGLO: Usar la URL que viene del backend (receipt_url)
    // Primero obtener los detalles del pedido para tener la URL correcta
    const orderResponse = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!orderResponse.ok) {
      throw new Error('No se pudo obtener información del pedido');
    }

    const orderData = await orderResponse.json();
    console.log('📊 Datos del pedido:', orderData);

    if (!orderData.success || !orderData.data.order.receipt_url) {
      throw new Error('Comprobante no disponible para este pedido');
    }

    // ⭐ USAR LA URL EXACTA DEL BACKEND
    const pdfUrl = orderData.data.order.receipt_url;
    console.log('📄 URL del PDF:', pdfUrl);

    const response = await fetch(pdfUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante_pedido_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        title: '✅ Descarga Exitosa',
        text: 'Tu comprobante PDF se ha descargado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      throw new Error('Archivo no encontrado');
    }
  } catch (error) {
    console.error('Error descargando PDF:', error);

    Swal.fire({
      title: '⚠️ Error de Descarga',
      text: `No se pudo descargar el comprobante: ${error.message}`,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Entendido'
    });
  }
};
  // Siguiente paso
  const nextStep = async () => {
    if (currentStep === 1) {
      if (validateShipping()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validatePayment()) {
        await processPayment();
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (paymentResult?.success) {
        await createOrder();
      }
    }
  };

  // Paso anterior
  const prevStep = () => {
    if (currentStep > 1 && !orderCreated) {
      setCurrentStep(currentStep - 1);
      setPaymentResult(null);
    }
  };

  if (isRedirecting || (!hasItems && !orderCreated)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">💳 Finalizar Compra</h1>
          <p className="text-green-100 text-lg">
            Estás a unos pasos de completar tu pedido
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            {/* Paso 1: Información de envío */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📦 Información de Envío
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingData.fullName}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingData.email}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingData.city}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingData.zipCode}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.zipCode ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionales (Opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={shippingData.notes}
                      onChange={handleShippingChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Instrucciones especiales para la entrega..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Información de pago */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💳 Información de Pago
                </h2>

                {/* Tarjetas de prueba */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Tarjetas de Prueba:
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>VISA:</strong> 4111 1111 1111 1111 (Aprobada)
                    </p>
                    <p>
                      <strong>MASTERCARD:</strong> 5555 5555 5555 4444
                      (Aprobada)
                    </p>
                    <p>
                      <strong>VISA:</strong> 4000 0000 0000 0002 (Rechazada)
                    </p>
                    <p>
                      <strong>CVV:</strong> Cualquier 3 dígitos |{" "}
                      <strong>Fecha:</strong> Cualquier fecha futura
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cardNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {paymentData.cardType && (
                        <div className="absolute right-3 top-3 text-sm font-medium text-gray-600">
                          {paymentData.cardType}
                        </div>
                      )}
                    </div>
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Expiración *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handlePaymentChange}
                      placeholder="MM/AA"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expiryDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handlePaymentChange}
                      placeholder="123"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvv ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentData.cardName}
                      onChange={handlePaymentChange}
                      placeholder="Como aparece en la tarjeta"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cardName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cardName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cardName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Procesamiento de pago */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                {paymentLoading ? (
                  <div>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      💳 Procesando Pago...
                    </h2>
                    <p className="text-gray-600">
                      Por favor espera mientras procesamos tu pago de forma
                      segura
                    </p>
                  </div>
                ) : paymentResult ? (
                  <div>
                    <div
                      className={`text-6xl mb-4 ${
                        paymentResult.success
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {paymentResult.success ? "✅" : "❌"}
                    </div>
                    <h2
                      className={`text-2xl font-bold mb-2 ${
                        paymentResult.success
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {paymentResult.success
                        ? "Pago Aprobado"
                        : "Pago Rechazado"}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {paymentResult.message}
                    </p>
                    {paymentResult.transactionId && (
                      <p className="text-sm text-gray-500 mb-6">
                        ID de Transacción: {paymentResult.transactionId}
                      </p>
                    )}
                    {paymentResult.success && (
                      <button
                        onClick={nextStep}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50"
                      >
                        {loading ? "Creando Pedido..." : "Confirmar Pedido"}
                      </button>
                    )}
                    {!paymentResult.success && (
                      <button
                        onClick={prevStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
                      >
                        Intentar Otro Método
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Paso 4: Confirmación */}
            {currentStep === 4 && orderCreated && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-6xl mb-4 text-green-500">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ¡Pedido Creado Exitosamente!
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Tu pedido ha sido procesado y recibirás un email de
                  confirmación pronto
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg mr-4"
                  >
                    Ver Mis Pedidos
                  </button>
                  <button
                    onClick={() => navigate("/products")}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
                  >
                    Seguir Comprando
                  </button>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            {currentStep < 3 && !orderCreated && (
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => navigate("/cart")}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  ← Volver al Carrito
                </button>
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {currentStep === 1 ? "Continuar al Pago" : "Procesar Pago"} →
                </button>
              </div>
            )}
          </div>

          {/* Resumen del pedido (sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Resumen del Pedido
              </h3>

              {/* Productos */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>
                    {summary.freeShipping
                      ? "GRATIS"
                      : formatPrice(summary.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (19%):</span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600 border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(summary.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
