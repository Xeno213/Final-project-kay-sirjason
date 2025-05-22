require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Warehouse Inventory Management System API is running.' });
});

const routes = require('./routes');

app.use('/api', routes);

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
