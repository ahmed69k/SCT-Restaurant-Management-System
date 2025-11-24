import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home/home";
import About from "../pages/about/about";
import Register from "../pages/register/register";

function AppRoutes(){
    return(
    <>
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/register" element={<Register/>}/>
    </Routes>
    </>
    )
}

export default AppRoutes