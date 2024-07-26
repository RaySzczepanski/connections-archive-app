import Board from './components/Board.jsx';
import { useState } from 'react';

function App() {
  const [title, setTitle] = useState("Connections");
  const handleGameChange = (newState) => {
    setTitle(newState.title);
  }
  return (
    <div className="App">
      <header>
        <h1>{title}</h1>
        <hr></hr>
      </header>
      <Board onGameChange={handleGameChange}/>
    </div>
  );
}

export default App;
