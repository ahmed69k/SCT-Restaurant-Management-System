import { Link } from "react-router-dom"
import './navbar.css'
function Navbar(){
    return(
        <>
        <div className="">
            <nav className="">
                <h1>Restaurant</h1>
                <ul className="">
                    <li> <Link to="/"> Home</Link></li>
                    <li> <Link to="/about"> About</Link></li>
                </ul>
            </nav>
        </div>
        </>
    )
}
export default Navbar