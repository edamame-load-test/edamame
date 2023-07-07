import TestList from "./components/TestList";
import Heading from "./components/Heading";
import TopBar from "./components/TopBar";
import { useState } from "react";

function App() {
  const [currTest, setCurrTest] = useState({});
  return (
    <div className="App text-slate-900">
      <TopBar />
      <Heading currTest={currTest} setCurrTest={setCurrTest} />
      <TestList currTest={currTest} setCurrTest={setCurrTest} />
    </div>
  );
}

export default App;
