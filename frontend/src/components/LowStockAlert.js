import React, { useEffect, useState } from 'react';

function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/stock/low-stock-alerts');
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch low stock alerts: ${text}`);
      }
      const data = await response.json();
      setLowStockItems(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockItems();
    const interval = setInterval(fetchLowStockItems, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading low stock alerts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Low Stock Alerts</h2>
      {lowStockItems.length === 0 ? (
        <p>All products have sufficient stock.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2 text-left">Product ID</th>
              <th className="border px-4 py-2 text-left">Product Name</th>
              <th className="border px-4 py-2 text-left">Warehouse ID</th>
              <th className="border px-4 py-2 text-right">Stock Quantity</th>
              <th className="border px-4 py-2 text-right">Low Stock Threshold</th>
              <th className="border px-4 py-2 text-center">Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map(item => {
              const isFull = item.warehouse && item.warehouse.capacity && item.quantity >= item.warehouse.capacity;
              return (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{item.product_id}</td>
                  <td className="border px-4 py-2">{item.product.name}</td>
                  <td className="border px-4 py-2">{item.warehouse_id}</td>
                  <td className="border px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border px-4 py-2 text-right">{item.product.low_stock_threshold}</td>
                  <td className={`border px-4 py-2 text-center font-bold ${isFull ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                    {isFull ? 'Full' : 'OK'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LowStockAlert;
