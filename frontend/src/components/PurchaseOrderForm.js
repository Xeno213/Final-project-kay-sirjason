import React, { useState, useEffect } from 'react';

function PurchaseOrderForm({ onSuccess, onCancel }) {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: '',
    status: 'Pending',
    items: [{ productId: '', quantity: 1 }],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('/api/suppliers');
        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, e) => {
    const newItems = [...formData.items];
    newItems[index][e.target.name] = e.target.value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1 }] }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate items
    if (formData.items.length === 0) {
      setError('At least one order item is required.');
      setLoading(false);
      return;
    }
    for (const item of formData.items) {
      if (!item.productId || item.quantity <= 0) {
        setError('All order items must have a product and quantity greater than zero.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: parseInt(formData.supplierId, 10),
          orderDate: formData.orderDate,
          status: formData.status,
          items: formData.items.map(item => ({
            productId: parseInt(item.productId, 10),
            quantity: parseInt(item.quantity, 10),
            warehouseId: 1 // Assuming default warehouse for now; can be extended
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create purchase order');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Supplier</label>
        <select
          name="supplierId"
          value={formData.supplierId}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Supplier</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Order Date</label>
        <input
          type="date"
          name="orderDate"
          value={formData.orderDate}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Pending">Pending</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Order Items</label>
        {formData.items.map((item, index) => (
          <div key={index} className="flex space-x-4 mb-2">
            <input
              type="number"
              name="productId"
              placeholder="Product ID"
              value={item.productId}
              onChange={(e) => handleItemChange(index, e)}
              required
              className="w-1/2 border px-3 py-2 rounded"
              min="1"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              required
              className="w-1/2 border px-3 py-2 rounded"
              min="1"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="bg-red-600 text-white px-3 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}

export default PurchaseOrderForm;
