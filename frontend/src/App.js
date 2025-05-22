import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import WarehouseList from './components/WarehouseList';
import ProductForm from './components/ProductForm';
import WarehouseForm from './components/WarehouseForm';
import StockList from './components/StockList';
import StockMovementForm from './components/StockMovementForm';
import StockTransferHistory from './components/StockTransferHistory';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import LowStockAlert from './components/LowStockAlert';
import SupplierList from './components/SupplierList';
import SupplierForm from './components/SupplierForm';
import PurchaseOrderList from './components/PurchaseOrderList';
import PurchaseOrderForm from './components/PurchaseOrderForm';

function App() {
  const [view, setView] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(false);
  const [refreshWarehouses, setRefreshWarehouses] = useState(false);
  const [refreshSuppliers, setRefreshSuppliers] = useState(false);
  const [refreshPurchaseOrders, setRefreshPurchaseOrders] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setRefreshProducts(prev => !prev);
  };

  const handleSupplierFormSuccess = () => {
    setShowSupplierForm(false);
    setRefreshSuppliers(prev => !prev);
  };

  const handlePurchaseOrderFormSuccess = () => {
    setShowPurchaseOrderForm(false);
    setRefreshPurchaseOrders(prev => !prev);
  };

  const handleWarehouseFormSuccess = () => {
    setShowWarehouseForm(false);
    setRefreshWarehouses(prev => !prev);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center justify-center">
        {showRegister ? (
          <>
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            <button
              className="mt-4 text-blue-600 underline"
              onClick={() => setShowRegister(false)}
            >
              Already have an account? Login
            </button>
          </>
        ) : (
          <>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <button
              className="mt-4 text-blue-600 underline"
              onClick={() => setShowRegister(true)}
            >
              Don't have an account? Register
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <header className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h1 className="text-4xl font-extrabold text-center flex-grow text-gray-900">
          Multi-Warehouse Inventory Management System
        </h1>
        <button
          onClick={handleLogout}
          className="ml-6 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded shadow transition"
        >
          Logout
        </button>
      </header>
      <nav className="flex justify-center space-x-6 mb-8">
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            view === 'products' ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setView('products')}
        >
          Products
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            view === 'warehouses' ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setView('warehouses')}
        >
          Warehouses
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            view === 'stock' ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setView('stock')}
        >
          Stock
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            view === 'stockMovement' ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setView('stockMovement')}
        >
          Stock Movement
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            view === 'stockTransferHistory' ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setView('stockTransferHistory')}
        >
          Stock Transfers
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            view === 'lowStockAlerts' ? 'bg-blue-700 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setView('lowStockAlerts')}
        >
          Low Stock Alerts
        </button>
      </nav>
      <main className="flex-grow max-w-6xl mx-auto w-full">
        {view === 'products' && (
          <>
            <button
              onClick={() => setShowProductForm(true)}
              className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow transition"
            >
              Add Product
            </button>
            {showProductForm && (
              <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
                <ProductForm onSuccess={handleProductFormSuccess} />
              </div>
            )}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ProductList key={refreshProducts} />
            </div>
          </>
        )}
        {view === 'warehouses' && (
          <>
            <button
              onClick={() => setShowWarehouseForm(true)}
              className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow transition"
            >
              Add Warehouse
            </button>
            {showWarehouseForm && (
              <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
                <WarehouseForm onSuccess={handleWarehouseFormSuccess} />
              </div>
            )}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <WarehouseList key={refreshWarehouses} />
            </div>
          </>
        )}
        {view === 'stock' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <StockList />
          </div>
        )}
        {view === 'stockMovement' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <StockMovementForm />
          </div>
        )}
        {view === 'stockTransferHistory' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <StockTransferHistory />
          </div>
        )}
        {view === 'lowStockAlerts' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <LowStockAlert />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
