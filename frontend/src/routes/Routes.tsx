import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home/home";
import About from "../pages/about/about";

function AppRoutes(){
    return(
    <>
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
    </Routes>
    </>
    )
}

export default AppRoutes