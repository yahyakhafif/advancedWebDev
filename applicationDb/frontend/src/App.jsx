import React, { useState } from 'react';
import ArchitectureList from './ArchitectureList';
import AddArchitecture from './AddArchitecture';

function App() {
  const [refreshList, setRefreshList] = useState(false);

  const handleAddArchitecture = (newArchitecture) => {
    setRefreshList(!refreshList);
  };

  return (
    <div className="container">
      <h1 className="mt-4">Architecture Database</h1>
      <AddArchitecture onAdd={handleAddArchitecture} />
      <ArchitectureList key={refreshList} />
    </div>
  );
}

export default App;

