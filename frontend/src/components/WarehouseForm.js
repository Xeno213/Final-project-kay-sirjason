import React, { useState, useEffect } from 'react';
import { getUserRole } from '../utils/tokenUtils';

function WarehouseForm({ warehouse, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const userRole = getUserRole();

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        location: warehouse.location || '',
        capacity: warehouse.capacity ? warehouse.capacity.toString() : '',
      });
    } else {
      setFormData({
        name: '',
        location: '',
        capacity: '',
      });
    }
  }, [warehouse]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const method = warehouse ? 'PUT' : 'POST';
      const url = warehouse
        ? `http://localhost:4000/api/warehouses/${warehouse.id}`
        : 'http://localhost:4000/api/warehouses';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save warehouse');
      }

      setFormData({
        name: '',
        location: '',
        capacity: '',
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disable fields only if user is Warehouse Manager AND editing an existing warehouse (warehouse prop present)
  const isWarehouseManager = userRole === 'Warehouse Manager';
  const disableFields = isWarehouseManager && warehouse;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">{warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-2">
        <label className="block mb-1">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={disableFields}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={disableFields}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Capacity</label>
        <input
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
          disabled={disableFields}
        />
      </div>
      <div className="flex space-x-4">
        {!disableFields && (
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? (warehouse ? 'Updating...' : 'Adding...') : (warehouse ? 'Update Warehouse' : 'Add Warehouse')}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default WarehouseForm;
