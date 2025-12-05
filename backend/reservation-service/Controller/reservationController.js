const axios = require('axios');
const reservationModel = require('../Model/Reservation');



async function getUserData(userId) {
    try {
        const response = await axios.get(
            `http://localhost:3000/api/v1/internal/users/${userId}`,
            {
                headers: {
                    "x-secret-code": process.env.SERVICE_SECRET
                }
            }
        );
        return response.data.user;
    } catch (e) {
        console.log("Error fetching user data:", e.message);
        return null; 
    }
}

async function getTableData(tableId) {
    try {
        const response = await axios.get(
            `http://localhost:3005/api/v1/internal/tables/${tableId}`,
            {
                headers: {
                    "x-secret-code": process.env.SERVICE_SECRET
                }
            }
        );
        return response.data.table;
    } catch (e) {
        console.log("Error fetching table data:", e.message);
        return null;
    }
}



const reservationController = {
    
    createReservation: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(403).json({ message: "User not logged in!" });

            const {date, time, numberOfGuests } = req.body;

            if (!date || !time || !numberOfGuests)
                return res.status(400).json({ message: "Missing reservation fields!" });

            // const table = await getTableData(tableId);
            // if (!table)
            //     return res.status(404).json({ message: "(R) Table not found!", table });

            const newReservation = await reservationModel.create({
                // table: tableId,
                numberOfGuests: numberOfGuests,
                customer: userId,
                date: date,
                time: time
            });
            return res.status(200).json({
                message: "Reservation created successfully!",
                reservation: newReservation
            });
        } catch (e) {
            return res.status(500).json({
                message: "Error creating reservation!",
                error: e.message
            });
        }
    },
    getAllReservations:async(req,res) =>{
        try{
            const reservations = await reservationModel.find()
            if(!reservations) return res.status(404).json({message: "Reservations not found!"})
            return res.status(200).json({message: "Reservations found!", reservations})
        }
        catch(e){
            return res.status(500).json("Error getting all reservations!", e)
        }
    },
    getReservationById:async(req,res) =>{
        try{
            const id = req.params.id
            const reservation = await reservationModel.findById(id)
            if(!reservation) return res.status(404).json({message: "Reservation not found!"})
            res.status(200).json({message:"Reservation found!",reservation})
        }
        catch(e){
            return res.status(500).json({message:"Error getting reservation by id!",e})
        }
    },
    getMyReservations:async(req,res)=>{
        try{
        const user = req.user.id
        const reservations = await reservationModel.find({customer:user})
        if(!reservations) return res.status(404).json({message:"User Reservations not found!"})
        return res.status(200).json({message:"User reservations found!",reservations})            
        }
        catch(e){
            return res.status(500).json({message: "Error getting user reservations!",e})
        }
    },
    cancelReservation: async (req, res) => {
        try {
            const reservationId = req.params.id;
            if (!reservationId)
                return res.status(400).json({ message: "Reservation ID is required!" });

            const deleted = await reservationModel.findByIdAndDelete(reservationId);

            if (!deleted)
                return res.status(404).json({ message: "Reservation not found!" });

            return res.status(200).json({
                message: "Reservation cancelled successfully!",
                reservation: deleted
            });
        } catch (e) {
            return res.status(500).json({
                message: "Error cancelling reservation!",
                error: e.message
            });
        }
    }
};

module.exports = reservationController;
