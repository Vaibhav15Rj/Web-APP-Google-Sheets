// Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the CORS library
require('dotenv').config(); // Load environment variables from .env file

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow requests from React frontend
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('Failed to connect to MongoDB:', err));

// Define the Cell schema
const CellSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'formula'], default: 'text' },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
});

// Create the model
const Cell = mongoose.model('Cell', CellSchema);

// Mathematical operation routes
app.get('/math/:operation', async (req, res) => {
  const { operation } = req.params;
  const operationResult = { result: null };

  try {
    // Fetch all numeric cell values and convert them to numbers
    const cells = await Cell.find({ type: 'number' });
    const values = cells.map((cell) => {
      const num = parseFloat(cell.content);
      return isNaN(num) ? 0 : num; // Replace invalid numbers with 0
    });

    // Perform the mathematical operation based on the request
    switch (operation) {
      case 'sum':
        operationResult.result = values.reduce((acc, val) => acc + val, 0);
        break;
      case 'average':
        if (values.length > 0) {
          operationResult.result = values.reduce((acc, val) => acc + val, 0) / values.length;
        } else {
          operationResult.result = 0;
        }
        break;
      case 'max':
        operationResult.result = Math.max(...values);
        break;
      case 'min':
        operationResult.result = Math.min(...values);
        break;
      case 'count':
        operationResult.result = values.length;
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.status(200).json(operationResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Data quality operation routes
app.post('/data-quality/:operation', async (req, res) => {
  const { operation } = req.params;
  const { row, column } = req.body;

  try {
    const cell = await Cell.findOne({ row, column });

    if (!cell) return res.status(404).json({ message: 'Cell not found' });

    switch (operation) {
      case 'trim':
        cell.content = cell.content.trim();
        break;
      case 'upper':
        cell.content = cell.content.toUpperCase();
        break;
      case 'lower':
        cell.content = cell.content.toLowerCase();
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await cell.save();
    res.status(200).json({ message: 'Data quality operation applied successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CRUD Routes
app.post('/cells', async (req, res) => {
  try {
    const { content, type, row, column } = req.body;
    const cell = new Cell({ content, type, row, column });
    await cell.save();
    res.status(201).json(cell);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/cells', async (req, res) => {
  try {
    const cells = await Cell.find();
    res.status(200).json(cells);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save Spreadsheet State
app.post('/save-spreadsheet', async (req, res) => {
  try {
    const { cellsData } = req.body; // Expecting an array of cell data
    await Cell.deleteMany({}); // Clear existing cells before saving new data
    await Cell.insertMany(cellsData); // Save new cells data
    res.status(200).json({ message: 'Spreadsheet saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving spreadsheet data', error: error.message });
  }
});

// Load Spreadsheet State
app.get('/load-spreadsheet', async (req, res) => {
  try {
    const cells = await Cell.find();
    res.status(200).json(cells);
  } catch (error) {
    res.status(500).json({ message: 'Error loading spreadsheet data', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
