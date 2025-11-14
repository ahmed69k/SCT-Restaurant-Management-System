const mongoose = require('mongoose')
const axios = require('axios')
const orderModel = require('../Model/orderModel')

async function getUserData(userId){
    try{
        const response = await axios.get(
            `http://localhost:4001/api/v1/internal/users/${userId}`,
            {headers: {"x-secret-code": process.env.USER_SERVICE_SECRET}}
        )
        return response.data.User
    }
    catch(e){
        console.log("Error fetching user data:",e)
    }
}
async function getMenuItemData(menuItemId){
    try{
        const response = await axios.get(
            `http://localhost:4001/api/v1/internal/menuItems/${menuItemId}`,
            {headers: {"x-secret-code": process.env.USER_SERVICE_SECRET}}
        )
        return response.data.menuItem
    }
    catch(e){
        console.log("Error fetching menu item data:",e)
    }
}

const orderController = {
    placeOrder: async(req,res)=>{
        try{
            const userId = req.user.id
            if(!userId) return res.status(403).json({message: "User not logged in!"})
            const {menuItemId} = req.body
            if(!Array.isArray(menuItemId)) return res.status(500).json({message: "MenuItemID not an array bro"})
            if(menuItemId.length===0) return res.status(500).json({message: "Order cannot be empty!"})
            const menuItems = await Promise.all(
                menuItemId.map(id=>getMenuItemData(id))
            )
            const totalPrice = menuItems.reduce((sum,item)=>sum + item.price,0);
            const createdOrder = await orderModel.create({
                customerId: userId,
                menuItemId:menuItemId,
                totalAmount: totalPrice,

            })
            return res.status(200).json({message: "Order created successfully!",Order:createdOrder})
        }
        catch(e){
            return res.status(500).json({message: "Error creating order!",e})
        }
    },
    cancelOrder: async(req,res)=>{
        try{
            const orderId = req.params.id
            if(!orderId)
                return res.status(404).json({message: "OrderID is required!"})
            const deletedOrder = await orderModel.findByIdAndDelete(orderId)
            if(!deletedOrder)
                return res.status(404).json({message: "Could not find order!"})
        }
        catch(e){
            return res.status(500).json({message:"Error cancelling order!",e})
        }
    },
}

module.exports = orderController;