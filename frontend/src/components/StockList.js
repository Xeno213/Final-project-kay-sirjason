import React, { useEffect, useState } from 'react';
import { getUserRole, getToken } from '../utils/tokenUtils';

function StockList() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [formError, setFormError] = useState(null);

  const userRole = getUserRole();

  useEffect(() => {
    fetch('http://localhost:4000/api/stock')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch stock data');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched stock data:', data);
        setStock(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAddStockClick = () => {
    setShowAddStockForm(true);
    setFormError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!productId || !warehouseId || !quantity) {
      setFormError('All fields are required.');
      return;
    }

    const token = getToken();
    if (!token) {
      setFormError('User not authenticated.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: parseInt(productId, 10),
          warehouseId: parseInt(warehouseId, 10),
          quantity: parseInt(quantity, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to add stock.');
        return;
      }

      const updatedStock = await response.json();
      setStock((prevStock) => {
        const index = prevStock.findIndex(
          (item) =>
            item.product_id === updatedStock.product_id &&
            item.warehouse_id === updatedStock.warehouse_id
        );
        if (index !== -1) {
          const newStock = [...prevStock];
          newStock[index] = updatedStock;
          return newStock;
        } else {
          return [...prevStock, updatedStock];
        }
      });

      setShowAddStockForm(false);
      setProductId('');
      setWarehouseId('');
      setQuantity('');
    } catch (err) {
      setFormError('Error adding stock.');
    }
  };

  if (loading) return <p>Loading stock data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Stock Levels</h2>
      <>
        {!showAddStockForm && (
          <button
            onClick={handleAddStockClick}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Stock
          </button>
        )}
        {showAddStockForm && (
          <form onSubmit={handleFormSubmit} className="mb-6 bg-white p-4 rounded shadow">
            {formError && <p className="text-red-600 mb-2">{formError}</p>}
            <div className="mb-2">
              <label className="block mb-1 font-semibold">Product ID</label>
              <input
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-semibold">Warehouse ID</label>
              <input
                type="number"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-semibold">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowAddStockForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Product ID</th>
            <th className="py-2 px-4 border-b">Warehouse ID</th>
            <th className="py-2 px-4 border-b">Quantity</th>
            <th className="py-2 px-4 border-b">Low Stock Alert</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => {
            const capacityThreshold = item.warehouse && item.warehouse.capacity ? item.warehouse.capacity * 0.1 : null;
            const isLowStock = (() => {
              if (!item.product) return false;
              const lowStockThreshold = item.product.low_stock_threshold;
              if (lowStockThreshold !== null && lowStockThreshold > 0) {
                if (item.quantity < lowStockThreshold) return true;
              }
              if (capacityThreshold !== null && capacityThreshold > 0) {
                if (item.quantity < capacityThreshold) return true;
              }
              return false;
            })();
            return (
              <tr
                key={item.id}
                className={`text-center ${isLowStock ? 'bg-red-100' : ''}`}
              >
                <td className="py-2 px-4 border-b">{item.product_id}</td>
                <td className="py-2 px-4 border-b">{item.warehouse_id}</td>
                <td className="py-2 px-4 border-b">
                  {item.warehouse && item.warehouse.capacity && item.quantity >= item.warehouse.capacity
                    ? 'Full'
                    : item.quantity.toLocaleString('en-PH')}
                </td>
                <td className="py-2 px-4 border-b">
                  {isLowStock ? (
                    <span className="text-red-600 font-bold">Low Stock</span>
                  ) : (
                    <span>OK</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StockList;
