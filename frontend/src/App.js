import "./App.css";
import Homepage from "./Pages/Homepage";
import { BrowserRouter as Routers, Routes, Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      {/* <Router> */}
      <Routes>
        <Route path="/" element={<Homepage />} exact />
        <Route path="/chats" element={<Chatpage />} />
        {/* <Route path="/" element={<Dashboard />}>
          <Route
            path="messages"
            element={<DashboardMessages />}
          /> */}
      </Routes>
      {/* </Router> */}
    </div>
  );
}

export default App;
