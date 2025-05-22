import React, { useState } from 'react';
import { getToken } from '../utils/tokenUtils';

function StockMovementForm() {
  const [formData, setFormData] = useState({
    productId: '',
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    quantity: '',
    status: 'Pending',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = getToken();
      if (!token) {
        setError('Authentication token is missing or expired. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await fetch('http://localhost:4000/api/stock/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId, 10),
          sourceWarehouseId: parseInt(formData.sourceWarehouseId, 10),
          destinationWarehouseId: parseInt(formData.destinationWarehouseId, 10),
          quantity: parseInt(formData.quantity, 10),
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to record stock transfer');
      }

      setFormData({
        productId: '',
        sourceWarehouseId: '',
        destinationWarehouseId: '',
        quantity: '',
        status: 'Pending',
      });
      setSuccessMessage('Stock transfer recorded successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Record Stock Transfer</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {successMessage && <p className="text-green-600 mb-2">{successMessage}</p>}
      <div className="mb-2">
        <label className="block mb-1">Product ID</label>
        <input
          name="productId"
          type="number"
          value={formData.productId}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Source Warehouse ID</label>
        <input
          name="sourceWarehouseId"
          type="number"
          value={formData.sourceWarehouseId}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Destination Warehouse ID</label>
        <input
          name="destinationWarehouseId"
          type="number"
          value={formData.destinationWarehouseId}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Quantity</label>
        <input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border px-2 py-1"
        >
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Received">Received</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Recording...' : 'Record Transfer'}
      </button>
    </form>
  );
}

export default StockMovementForm;
  