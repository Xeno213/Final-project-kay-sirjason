import React, { useEffect, useState } from 'react';

function StockTransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/stock/transfer/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch stock transfer history');
        }
        return res.json();
      })
      .then(data => {
        setTransfers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading stock transfer history...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Stock Transfer History</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Product ID</th>
            <th className="py-2 px-4 border-b">Source Warehouse ID</th>
            <th className="py-2 px-4 border-b">Destination Warehouse ID</th>
            <th className="py-2 px-4 border-b">Quantity</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Transfer Date</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map(transfer => (
            <tr key={transfer.id} className="text-center">
              <td className="py-2 px-4 border-b">{transfer.product_id}</td>
              <td className="py-2 px-4 border-b">{transfer.source_warehouse_id || '-'}</td>
              <td className="py-2 px-4 border-b">{transfer.destination_warehouse_id || '-'}</td>
              <td className="py-2 px-4 border-b">{transfer.quantity}</td>
              <td className="py-2 px-4 border-b">{transfer.status}</td>
              <td className="py-2 px-4 border-b">{new Date(transfer.transfer_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockTransferHistory;
