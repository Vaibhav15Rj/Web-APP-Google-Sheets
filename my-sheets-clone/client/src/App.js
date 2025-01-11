import React from 'react';
import Spreadsheet from './Spreadsheet';

const App = () => {
  return (
    <div>
      <h1>Spreadsheet App</h1>
      {/* This will render the Spreadsheet component within your main app */}
      <Spreadsheet />
    </div>
  );
};

export default App;