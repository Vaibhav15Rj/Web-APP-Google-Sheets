import React, { useState, useEffect } from "react";
import axios from "axios";

const Spreadsheet = () => {
  const [cells, setCells] = useState([]);
  const [result, setResult] = useState(null); // For storing results of mathematical operations

  useEffect(() => {
    fetchCells(); // Fetch data when the component loads
  }, []);

  // Fetch data from the backend
  const fetchCells = async () => {
    try {
      const response = await axios.get("http://localhost:5000/cells");
      setCells(response.data); // Set the data from the backend
    } catch (error) {
      console.error("Error fetching cells:", error.message);
    }
  };

  // Add a new row
  const addRow = async () => {
    const newRow = {
      content: "New Cell",
      type: "text",
      row: cells.length + 1,
      column: 1,
    };
    try {
      const response = await axios.post("http://localhost:5000/cells", newRow);
      setCells([...cells, response.data]);
    } catch (error) {
      console.error("Error adding row:", error.response?.data?.message || error.message);
    }
  };

  // Update a cell
  const updateCell = async (id, updatedValue) => {
    try {
      await axios.put(`http://localhost:5000/cells/${id}`, { content: updatedValue });
      fetchCells();
    } catch (error) {
      console.error("Error updating cell:", error.response?.data?.message || error.message);
    }
  };

  // Save Spreadsheet State
  const saveSpreadsheet = async () => {
    try {
      const cellsData = cells.map((cell) => ({
        content: cell.content,
        type: cell.type,
        row: cell.row,
        column: cell.column,
      }));
      await axios.post("http://localhost:5000/save-spreadsheet", { cellsData });
      alert("Spreadsheet saved successfully!");
    } catch (error) {
      console.error("Error saving spreadsheet:", error.message);
    }
  };

  // Load Spreadsheet State
  const loadSpreadsheet = async () => {
    try {
      const response = await axios.get("http://localhost:5000/load-spreadsheet");
      setCells(response.data);
    } catch (error) {
      console.error("Error loading spreadsheet:", error.message);
    }
  };

  // Mathematical functions
  const performOperation = (operation) => {
    const numericValues = cells
      .map((cell) => parseFloat(cell.content))
      .filter((value) => !isNaN(value));

    let resultValue = null;
    switch (operation) {
      case "SUM":
        resultValue = numericValues.reduce((a, b) => a + b, 0);
        break;
      case "AVERAGE":
        resultValue = numericValues.reduce((a, b) => a + b, 0) / numericValues.length || 0;
        break;
      case "MAX":
        resultValue = Math.max(...numericValues);
        break;
      case "MIN":
        resultValue = Math.min(...numericValues);
        break;
      case "COUNT":
        resultValue = numericValues.length;
        break;
      default:
        resultValue = "Invalid Operation";
    }
    setResult(`${operation} Result: ${resultValue}`);
  };

  return (
    <div>
      <h1>Spreadsheet</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Row</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cells.map((cell, index) => (
            <tr key={cell._id || index}>
              <td>{cell.row}</td>
              <td>
                <input
                  type="text"
                  value={cell.content}
                  onChange={(e) =>
                    setCells((prevCells) =>
                      prevCells.map((prevCell) =>
                        prevCell._id === cell._id
                          ? { ...prevCell, content: e.target.value }
                          : prevCell
                      )
                    )
                  }
                  onBlur={() => updateCell(cell._id, cell.content)}
                />
              </td>
              <td>
                <button onClick={() => updateCell(cell._id, cell.content)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>Add Row</button>
      <div>
        <h2>Mathematical Functions</h2>
        <button onClick={() => performOperation("SUM")}>SUM</button>
        <button onClick={() => performOperation("AVERAGE")}>AVERAGE</button>
        <button onClick={() => performOperation("MAX")}>MAX</button>
        <button onClick={() => performOperation("MIN")}>MIN</button>
        <button onClick={() => performOperation("COUNT")}>COUNT</button>
      </div>
      {result && <div><h3>{result}</h3></div>}

      <div>
        <h2>Save/Load Spreadsheet</h2>
        <button onClick={saveSpreadsheet}>Save Spreadsheet</button>
        <button onClick={loadSpreadsheet}>Load Spreadsheet</button>
      </div>
    </div>
  );
};

export default Spreadsheet;
