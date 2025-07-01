import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { productService } from "../../services/productService";

const ProductList = ({
  showActions = false,
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showForm, setShowForm] = useState(false)

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);



  // Función para cargar productos
  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await productService.getProducts();
      if (result.success) {
        setProducts(result.products);
        setFilteredProducts(result.products);
      } else {
        setError(result.message);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Error de conexión al cargar productos");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar la lista
  const handleRefresh = () => {
    loadProducts();
  };

  // Función para manejar eliminación de producto
  const handleDelete = async (product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      if (onDelete) {
        await onDelete(product);
        // Recargar la lista después de eliminar
        loadProducts();
      }
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar productos
          </h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header con búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Información de productos */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Productos Disponibles
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} producto
            {filteredProducts.length !== 1 ? "s" : ""}
            {searchTerm &&
              ` encontrado${
                filteredProducts.length !== 1 ? "s" : ""
              } para "${searchTerm}"`}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {/* Botón refrescar */}
          <button
            onClick={handleRefresh}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar productos por nombre, descripción o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No se encontraron productos"
                : "No hay productos disponibles"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Aún no hay productos en el catálogo"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showActions={showActions}
              onAddToCart={onAddToCart}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
