import { useState } from "react"
import axios from "axios"
import {toast} from 'react-toastify'
import { useNavigate } from "react-router-dom"

function Register(){
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        const form: FormData = new FormData()
        form.append("email",email);
        form.append("name", name);
        form.append("email", email);
        form.append("password", password);
        form.append("role", role);
        try{
           await axios.post('http://localhost:3000/api/v1/register',
            {name,email,password,role},
            {withCredentials: true}
           )
           toast.success("Registered successfully!")
           navigate("/home")
           
        }
        catch(e:any){
            if(e.response){
                if(e.response.status === 409){
                    toast.error("Email already exists!")
                }
                else{
                    toast.error("Error registering!")
                }
            }
            console.log("Error Reaching Register!",e)
            
        }
    }
    return(
        <>
        <div style={{display: "flex", flexDirection: "column", width: "100vw",height:"100vh", justifyContent: 'center', alignItems: "center"}}>
            <h1>Register</h1>
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", width: "300px", gap: "20px", justifyContent: "center", alignItems: "center"}}>
            <input type="text" name="name" placeholder="Enter your name..." onChange={e=> setName(e.target.value)} value={name} />
            <input type="text" name="email" placeholder="Enter your email..."onChange={e=> setEmail(e.target.value)} value={email} />
            <input type="text" name="password" placeholder="Enter your password..."onChange={e=> setPassword(e.target.value)} value={password}/>
            <select name="" id=""onChange={e=> setRole(e.target.value)} value={role}>
                <option value="" disabled>Select Role</option>
                <option value="User">User</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
            </select>
            <button type="submit" style={{width: "100px"}}>Submit</button>
        </form>
        </div>
        </>
    )
}
export default Register