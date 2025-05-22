# Multi-Warehouse Inventory Management System

This project is a full-stack inventory management system to handle product inventory across multiple warehouses. It includes a ReactJS + TailwindCSS frontend, an Express + NodeJS backend, and uses Supabase for database and authentication.

## Features

- Product catalog management with CRUD operations
- Warehouse management with CRUD operations
- Stock tracking and stock movement between warehouses
- User authentication with role-based access control (Admin, Warehouse Manager, Staff)
- Supplier and purchase order management
- Audit trail logging
- Responsive frontend UI with forms and tables

## Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn
- Supabase account and project with configured tables and API keys

## Setup

### Backend

1. Navigate to the `backend` directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example` and fill in your Supabase credentials and JWT secret.

4. Start the backend server:

```bash
npm run dev
```

The backend API will be available at `http://localhost:4000/api`.

### Frontend

1. Navigate to the `frontend` directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm start
```

The frontend app will be available at `http://localhost:3000`.

## Usage

- Register a new user or login with existing credentials.
- Use the navigation buttons to manage products, warehouses, stock, and stock movements.
- Add new products and warehouses using the provided forms.
- Record stock transfers between warehouses.
- View audit logs and reports (to be implemented).

## Next Steps

- Implement reporting and analytics frontend.
- Add more comprehensive error handling and notifications.
- Deploy the application to a cloud provider.
- Write unit and integration tests.
- Improve UI/UX with better styling and user feedback.

## License

This project is open source and available under the MIT License.
