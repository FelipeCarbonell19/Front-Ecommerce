// src/pages/products/CreateProductPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import productService from '../../services/productService';
import Header from '../../components/layout/Header';

const CreateProductPage = () => {
  const navigate = useNavigate();

  const handleCreateProduct = async (formData) => {
    try {
      await productService.createProduct(formData);
      alert('Producto creado con éxito');
      navigate('/admin/products'); // Redirigir a la página de gestión
    } catch (error) {
      console.error("Error al crear el producto:", error);
      alert('Error al crear el producto');
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Añadir Nuevo Producto</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      </div>
    </>
  );
};

export default CreateProductPage;