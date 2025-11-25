const userSchema = require('../Model/userModel')
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
                return res.status(404).json({message: "User not found!"})
            }
            const passwordCorrect = await bcrypt.compare(password, foundUser.password)
            if(!passwordCorrect){
                return res.status(500).json({message: "Pasword is incorrect!"})
            }
            console.log(process.env.SECRET_KEY)
            const token = jwt.sign(
                { 
                user:{
                    id: foundUser._id,
                    role: foundUser.role
                    }
                    
                },
                process.env.SECRET_KEY,
                {expiresIn: "3h"}
                
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
            if(!user) return res.status(404).json({message: "User not found!"})
            console.log("User:",user)
            if(req.user.id != req.params.id && req.user.role != "Admin") return res.status(403).json({message: "You can only delete your account!"})
            await userSchema.findByIdAndDelete(req.params.id)
            return res.status(200).json({message: "User deleted successfully!"})
        }
        catch(e){
            return res.status(500).json({message: "Error deleting user!", e})
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
    getCurrentUser: async(req,res) =>{
        try{
            const user = await userSchema.findById(req.user.id).select('-password')
            if(!user) return res.status(404).json({message:"User not found!"})
            return res.status(200).json({user})
        }
        catch(e){
            return res.status(500).json({message:"Error getting current user!"})
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
    },
    updateUser: async(req,res)=>{
        try{
            const id = req.params.id
            const {name, email, password} = req.body
            const user = await userSchema.findById(id)
            if(req.user.id != id && req.user.role != "Admin") return res.status(403).json({message: "You can only update your own account!"})
            if(!user) return res.status(404).json({message:"User not found!"})
            const updatedData ={
                name: name,
                email: email
            }
            if(password){
                updatedData.password = await bcrypt.hash(password, 10)
            }
            const updatedUser = await userSchema.findByIdAndUpdate(id,updatedData,{new: true})
            return res.status(200).json({message: "User updated!", User: updatedUser})
        }
        catch(e){
            return res.status(500).json({message: "Error updating user!",e})
        }
    }
}

module.exports = userController;