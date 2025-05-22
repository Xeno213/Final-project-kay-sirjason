import React, { useState, useEffect } from 'react';
import { getUserRole } from '../utils/tokenUtils';

function ProductForm({ product, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    costPrice: '',
    sellingPrice: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const userRole = getUserRole();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        supplier: product.supplier || '',
        costPrice: product.cost_price ? product.cost_price.toString() : '',
        sellingPrice: product.selling_price ? product.selling_price.toString() : '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        supplier: '',
        costPrice: '',
        sellingPrice: '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const method = product ? 'PUT' : 'POST';
      const url = product
        ? `http://localhost:4000/api/products/${product.id}`
        : 'http://localhost:4000/api/products';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          supplier: formData.supplier,
          costPrice: parseFloat(formData.costPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || (product ? 'Failed to update product' : 'Failed to add product'));
      }

      setFormData({
        name: '',
        sku: '',
        category: '',
        supplier: '',
        costPrice: '',
        sellingPrice: '',
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isWarehouseManager = userRole === 'Warehouse Manager';

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-2">
        <label className="block mb-1">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={isWarehouseManager}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">SKU</label>
        <input
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={isWarehouseManager}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Category</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={isWarehouseManager}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Supplier</label>
        <input
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={isWarehouseManager}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Cost Price</label>
        <input
          name="costPrice"
          type="number"
          step="0.01"
          value={formData.costPrice}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={isWarehouseManager}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Selling Price</label>
        <input
          name="sellingPrice"
          type="number"
          step="0.01"
          value={formData.sellingPrice}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={isWarehouseManager}
        />
      </div>
      {!isWarehouseManager && (
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? (product ? 'Updating...' : 'Adding...') : (product ? 'Update Product' : 'Add Product')}
        </button>
      )}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="ml-4 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export default ProductForm;
