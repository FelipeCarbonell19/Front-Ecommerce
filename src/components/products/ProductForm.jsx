import { useState, useEffect } from "react";
import productService from "../../services/productService";
import Swal from "sweetalert2";

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: 1,
    stock: "",
    image_url: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Nuevos estados para archivo
  const [imageFile, setImageFile] = useState(null);
  const [useFileUpload, setUseFileUpload] = useState(false);

  // Llenar formulario si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category_id: product.category_id || 1,
        stock: product.stock || "",
        image_url: product.image_url || "",
      });
    }
  }, [product]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no puede ser mayor a 5MB");
        return;
      }
      setImageFile(file);
    }
  };

  // Validar formulario (SIN CAMBIOS)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (formData.description.length < 10) {
      newErrors.description =
        "La descripción debe tener al menos 10 caracteres";
    }

    if (!formData.price) {
      newErrors.price = "El precio es requerido";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "El precio debe ser un número mayor a 0";
    }

    if (!formData.stock) {
      newErrors.stock = "El stock es requerido";
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = "El stock debe ser un número mayor o igual a 0";
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = "La URL de la imagen no es válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar URL (SIN CAMBIOS)
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Manejar envío del formulario - CORREGIDO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (typeof onSave !== "function") {
      console.error("onSave is not a function:", onSave);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "onSave function not provided",
      });
      return;
    }

    setLoading(true);

    try {
      let result;

      if (useFileUpload && imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("price", parseFloat(formData.price));
        formDataToSend.append("category_id", parseInt(formData.category_id));
        formDataToSend.append("stock", parseInt(formData.stock));
        formDataToSend.append("image", imageFile);

        if (product?.id) {
          result = await productService.updateProductWithImage(
            product.id,
            formDataToSend
          );
        } else {
          result = await productService.createProductWithImage(formDataToSend);
        }

        if (result.success) {
          await Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: result.message,
            timer: 2000,
            showConfirmButton: false,
          });

          if (typeof onCancel === "function") {
            onCancel(); 
          }
          return; 
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.message,
          });
          return; 
        }
      } else {
        const dataToSend = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          stock: parseInt(formData.stock),
          image_url: formData.image_url.trim() || null,
        };

        await onSave(dataToSend);

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: product?.id
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al guardar el producto",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nombre del Producto *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Ej: iPhone 15 Pro"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Descripción *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe las características principales del producto..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Precio y Stock en la misma fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precio */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Precio (COP) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.stock ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Categoría *
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Electrónicos</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Nota: Solo "Electrónicos" disponible en la BD actual
        </p>
      </div>

      {/* NUEVA SECCIÓN: Selector de tipo de imagen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen del Producto
        </label>
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setUseFileUpload(false)}
            className={`px-4 py-2 rounded-lg ${
              !useFileUpload
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            📎 URL de Imagen
          </button>
          <button
            type="button"
            onClick={() => setUseFileUpload(true)}
            className={`px-4 py-2 rounded-lg ${
              useFileUpload
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            📁 Subir Archivo
          </button>
        </div>

        {/* Mostrar campo según selección */}
        {!useFileUpload ? (
          <div>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.image_url ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://images.unsplash.com/photo-..."
            />
            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Recomendado: URLs de Unsplash para imágenes de alta calidad
            </p>
          </div>
        ) : (
          // Campo archivo (nuevo)
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Formatos permitidos: JPEG, PNG, GIF, WEBP. Tamaño máximo: 5MB
            </p>
            {imageFile && (
              <p className="mt-2 text-sm text-green-600">
                ✅ Archivo seleccionado: {imageFile.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Vista previa de imagen (solo para URL) */}
      {!useFileUpload &&
        formData.image_url &&
        isValidUrl(formData.image_url) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Previa
            </label>
            <div className="border border-gray-300 rounded-lg p-4">
              <img
                src={formData.image_url}
                alt="Vista previa"
                className="w-32 h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/128x128/e5e7eb/6b7280/png?text=Error";
                }}
              />
            </div>
          </div>
        )}

      {/* Botones (SIN CAMBIOS) */}
      <div className="flex space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {product ? "Actualizando..." : "Creando..."}
            </div>
          ) : product ? (
            "💾 Actualizar Producto"
          ) : (
            "➕ Crear Producto"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
