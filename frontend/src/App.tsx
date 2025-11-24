import Home from "./pages/home/home"
import AppRoutes from "./routes/Routes"
import Navbar from "./components/navbar/navbar"
import { ToastContainer } from "react-toastify"
function App() {

  return (
    <>
    <ToastContainer></ToastContainer>
    <Navbar></Navbar>
    <AppRoutes></AppRoutes>

    </>
  )
}

export default App
