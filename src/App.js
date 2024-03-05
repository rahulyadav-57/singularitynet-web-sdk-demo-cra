import logo from './logo.svg';
import './App.css';
import ExampleService from './ExampleService';
window.Buffer = window.Buffer || require("buffer").Buffer; 


function App() {
  return (
    <div className="App">
      <ExampleService />
    </div>
  );
}

export default App;
