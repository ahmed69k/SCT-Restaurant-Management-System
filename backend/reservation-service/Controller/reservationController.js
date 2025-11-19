const reservationSchema = require('../Model/Reservation');
const tableSchema = require('../../table-service/Model/Table');
const axios = require('axios');

async function getUserData(userId) {
    try {
        const response = await axios.get(
            `http://localhost:4001/api/v1/internal/users/${userId}`,
            { headers: { "x-secret-code": process.env.USER_SERVICE_SECRET } }
        );
        return response.data.User;
    } catch (e) {
        console.log("Error fetching user data:", e);
    }
}

const reservationController = {
    createReservation: async (req, res) => {
        try {
            const user = await getUserData(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { seatingType, reservationTime } = req.body;

            // to check if seating type is valid
            const validSeatingTypes = ["Double", "Booth", "Couch"];
            if (!validSeatingTypes.includes(seatingType)) {
                return res.status(400).json({ message: "Invalid seating type" });
            }

            // specifically with the REQUESTED seating type
            const table = await tableSchema.findOne({ isFree: true, seatingType });
            if (!table) {
                return res.status(404).json({ message: "No available tables for the requested seating type" });
            }


            const newReservation = new reservationSchema({
                userId: user.id,
                tableId: table._id,
                reservationTime,
            });

            await newReservation.save();

            
            table.isFree = false;
            await table.save();

            res.status(201).json({ message: "Reservation created successfully", reservation: newReservation });
        } catch (error) {
            console.error("Error creating reservation:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};

module.exports = reservationController;