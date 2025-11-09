const userSchema = require('../Model/User')
const bcrypt = require('bcrypt')

const userController = {
    register: async(req,res)=>{
        try{
            const {name,email,password} = req.body;
            const existingUser = await userSchema.findOne({email})
            if(existingUser){
                return res.status(409).json("Email already in use!")
            }
            const hashedPass = await bcrypt.hash(password,10)
            const newUser = new userSchema({
                name: name,
                email: email,
                password: hashedPass,
                
            })
            await newUser.save()
            return res.status(200).json({message: "User Registered Successfully!",newUser})
        }
        catch(e){
            res.status(500).json("Error Registering User:" + e)
        }
    }
}

module.exports = userController;