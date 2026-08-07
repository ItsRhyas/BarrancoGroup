import { GameBoard } from "./components/GameBoard";
import { RotateDevice } from "./components/RotateDevice";
import "./App.css";

function App() {
  return (
    <div className="stage">
      <GameBoard />
      <RotateDevice />
    </div>
  );
}

export default App;
