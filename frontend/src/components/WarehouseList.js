import React, { useEffect, useState } from 'react';
import WarehouseForm from './WarehouseForm';

function WarehouseList() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const fetchWarehouses = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/warehouses')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch warehouses');
        }
        return res.json();
      })
      .then((data) => {
        setWarehouses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
  };

  const handleDelete = async (warehouseId) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/warehouses/${warehouseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete warehouse');
      }

      fetchWarehouses();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading warehouses...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4" style={{ backgroundImage: "url('/3888.JPG')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h2 className="text-2xl font-bold mb-4">Warehouse Management</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Location</th>
            <th className="py-2 px-4 border-b">Capacity</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => (
            <tr
              key={warehouse.id}
              className="text-center cursor-pointer hover:bg-gray-100"
              onClick={() => {
                handleEdit(warehouse);
              }}
            >
              <td className="py-2 px-4 border-b">{warehouse.name}</td>
              <td className="py-2 px-4 border-b">{warehouse.location}</td>
              <td className="py-2 px-4 border-b">{warehouse.capacity}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(warehouse);
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(warehouse.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingWarehouse && (
        <WarehouseForm
          warehouse={editingWarehouse}
          onSuccess={() => {
            setEditingWarehouse(null);
            fetchWarehouses();
          }}
          onCancel={() => {
            setEditingWarehouse(null);
          }}
        />
      )}
    </div>
  );
}

export default WarehouseList;
