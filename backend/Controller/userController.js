const userSchema = require('../Model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const userController = {
    register: async(req,res)=>{
        try{
            const {name,email,password,role} = req.body;
            const existingUser = await userSchema.findOne({email})
            if(existingUser){
                return res.status(409).json("Email already in use!")
            }
            const hashedPass = await bcrypt.hash(password,10)
            const newUser = new userSchema({
                name: name,
                email: email,
                password: hashedPass,
                role: role
                
            })
            await newUser.save()
            return res.status(200).json({message: "User Registered Successfully!",newUser})
        }
        catch(e){
            res.status(500).json("Error Registering User:" + e)
        }
    },
    login: async(req,res) => {
        try{
            const {email, password} = req.body;
            const foundUser = await userSchema.findOne({email})
            console.log(foundUser)
            if(!foundUser){
                return res.status(404).json({message: "Email not found!"})
            }
            const passwordCorrect = await bcrypt.compare(password, foundUser.password)
            if(!passwordCorrect){
                return res.status(500).json({message: "Pasword is incorrect!"})
            }
            const token = jwt.sign(
                { 
                user:{
                    id: foundUser._id,
                    role: foundUser.role
                    }
                    
                },
                process.env.SECRET_KEY,
                {expiresIn: 3 * 60 * 60}
            )
            const cookieOptions = {
                httpOnly:true,
            }
            return res.cookie('token',token,cookieOptions).status(200).json({message: "User logged in successfully!",token: token})
        }
        catch(e){
            return res.status(500).json({message:"Error logging in!", e})
        }
    },
    logout: async(req,res) => {
        try{
            res.clearCookie("token",{httpOnly: true})
            return res.status(200).json({message: "User logged out sucessfully!"})
        }
        catch(e){
            return res.status(500).json({message:"Error logging out"})
        }
    },
    delete: async(req,res) =>{
        try{
            const user = await userSchema.findById(req.params.id)
            if(!user){
                return res.status(404).json({message: "User not found!"})
            }
            await userSchema.findByIdAndDelete(req.params.id)
            return res.status(200).json({message: "User deleted successfully!"})
        }
        catch(e){
            return res.status(500).json({message: "Error logging out!", e})
        }
    },
    getUser: async(req,res) => {
        try{
            const user = await userSchema.findById(req.params.id);
            if(!user){
                return res.status(404).json({message: "User not found!"})
            }
            return res.status(200).json({message: "User found!", User: user})
        }
        catch(e){
            return res.status(500).json({message: "Error getting user!",e})
        }
    },
    getUsers: async(req,res) => {
        try{
            const users = await userSchema.find()
            if(!users){
                return res.status(404).json({message: "No users found!"})
            }
            return res.status(200).json({message: "Users found:", users})
        }
        catch(e){
            return res.status(500).json({message: "Error getting users!",e})
        }
    }
}

module.exports = userController;