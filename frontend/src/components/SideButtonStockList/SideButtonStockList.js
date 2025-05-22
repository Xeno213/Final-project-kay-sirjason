import React, { useState } from 'react';

function SideButtonStockList() {
  const [stock, setStock] = useState([
    { id: 1, product_id: 101, warehouse_id: 1, quantity: 50, product: { low_stock_threshold: 20 } },
    { id: 2, product_id: 102, warehouse_id: 1, quantity: 10, product: { low_stock_threshold: 15 } },
    { id: 3, product_id: 103, warehouse_id: 2, quantity: 5, product: { low_stock_threshold: 10 } },
  ]);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [formError, setFormError] = useState(null);

  const handleAddStockClick = () => {
    setShowAddStockForm(true);
    setFormError(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!productId || !warehouseId || !quantity) {
      setFormError('All fields are required.');
      return;
    }

    const newStock = {
      id: stock.length + 1,
      product_id: parseInt(productId, 10),
      warehouse_id: parseInt(warehouseId, 10),
      quantity: parseInt(quantity, 10),
      product: { low_stock_threshold: 10 }, // default threshold
    };

    setStock((prevStock) => [...prevStock, newStock]);
    setShowAddStockForm(false);
    setProductId('');
    setWarehouseId('');
    setQuantity('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex">
      <div className="flex flex-col space-y-4 mr-6">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Dashboard
        </button>
        {!showAddStockForm && (
          <button
            onClick={handleAddStockClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Stock
          </button>
        )}
        {showAddStockForm && (
          <>
            <button
              onClick={handleFormSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
            <button
              onClick={() => setShowAddStockForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        )}
      </div>
      <div className="flex-1">
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
          </form>
        )}
        <h2 className="text-2xl font-bold mb-4">Stock Levels (Sidebar Buttons)</h2>
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
              const isLowStock =
                item.product.low_stock_threshold !== null &&
                item.quantity < item.product.low_stock_threshold;
              return (
                <tr
                  key={item.id}
                  className={`text-center ${isLowStock ? 'bg-red-100' : ''}`}
                >
                  <td className="py-2 px-4 border-b">{item.product_id}</td>
                  <td className="py-2 px-4 border-b">{item.warehouse_id}</td>
                  <td className="py-2 px-4 border-b">{item.quantity.toLocaleString('en-PH')}</td>
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
    </div>
  );
}

export default SideButtonStockList;
