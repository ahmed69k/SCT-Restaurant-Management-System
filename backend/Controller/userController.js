const userSchema = require('../Model/User')
const bcrypt = require('bcrypt')

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
            if(!foundUser){
                return res.status(404).json({message: "Email not found!"})
            }
            const passwordCorrect = await bcrypt.compare(password, foundUser.password)
            if(!passwordCorrect){
                return res.status(500).json({message: "Pasword is incorrect!"})
            }
            return res.status(200).json({message: "User logged in successfully!"})
        }
        catch(e){
            return res.status(500).json({message:"Error logging in!", e})
        }
    }
}

module.exports = userController;