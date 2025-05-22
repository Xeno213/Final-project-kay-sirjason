# Setup Instructions for React Project on New Environment

Follow these steps to set up the React frontend and backend projects on a new computer:

## Prerequisites

- Install [Node.js](https://nodejs.org/) (which includes npm)
- Install [Git](https://git-scm.com/) (optional, for cloning the repo)

## Steps

1. **Clone or copy the project files** to your new machine.

2. **Open a terminal** and navigate to the project root directory.

3. **Install frontend dependencies:**

   ```bash
   cd frontend
   npm install
   ```

4. **Install backend dependencies:**

   ```bash
   cd ../backend
   npm install
   ```

5. **Configure environment variables:**

   - If your project uses environment variables, create `.env` files in `frontend` and `backend` directories as needed.
   - Update API URLs or tokens if necessary.

6. **Start the backend server:**

   ```bash
   npm start
   ```

   or if you use nodemon:

   ```bash
   npm run dev
   ```

7. **Start the frontend development server:**

   Open a new terminal, navigate to the `frontend` directory, and run:

   ```bash
   npm start
   ```

8. **Access the application:**

   - Frontend usually runs on `http://localhost:3000`
   - Backend usually runs on `http://localhost:4000` (or as configured)

## Notes

- Make sure ports used by frontend and backend are not blocked or used by other applications.
- If you change backend URLs, update the frontend API calls accordingly.
- For production deployment, follow your deployment platform's instructions.

---

If you want, I can also help you create a setup script to automate these steps.
