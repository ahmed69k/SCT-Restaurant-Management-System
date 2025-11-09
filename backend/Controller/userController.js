const userSchema = require('../Model/User')
const bcrypt = require('bcrypt')

const userController = {
    register: async(req,res)=>{
        try{
            const {name,email,password} = req.body;
            const existingUser = userSchema.findOne({email})
            if(existingUser){
                return res.status(409).json("Email already in use!")
            }
            const hashedPass = bcrypt.hash(password)
            const newUser = new userSchema({
                email: email,
                password: hashedPass,
                name: name
            })
            await newUser.save()
            res.status(200).json("User created successfully!")
        }
        catch(e){
            res.status(500).json("Error Registering User:",e)
        }
    }
}