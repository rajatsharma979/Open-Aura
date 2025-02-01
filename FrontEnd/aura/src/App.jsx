import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Event from "./pages/Event"
// import PrivateRoute from "./components/PrivateRoute"
export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/event" element={<Event/>}></Route>
          </Routes>
        </div>
      </div>
    </Router>
  )
}

