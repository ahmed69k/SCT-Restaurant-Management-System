const Reservation = require("../Model/Reservation");
const Table = require("../../table-service/Model/Table");
const axios = require("axios");

async function getUserData(userId) {
    try {
        const response = await axios.get(
            `http://localhost:4001/api/v1/internal/users/${userId}`,
            { headers: { "x-secret-code": process.env.USER_SERVICE_SECRET } }
        );
        return response.data.User;
    } catch (error) {
        console.log("Error fetching user data:", error);
        return null;
    }
}

const reservationController = {

    createReservation: async (req, res) => {
        try {
            const user = await getUserData(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const {
                foodType,
                drink,
                seatingType,
                reservationTime,
                numberOfGuests
            } = req.body;

            // validate seating type
            const validSeatingTypes = ["Double", "Booth", "Couch"];
            if (!validSeatingTypes.includes(seatingType)) {
                return res.status(400).json({ message: "Invalid seating type" });
            }

            // find available table
            const table = await Table.findOne({ isFree: true, seatingType });
            if (!table) {
                return res.status(404).json({
                    message: "No free tables available for this seating type"
                });
            }

            // create reservation
            const reservation = await Reservation.create({
                customer: req.user.id,
                foodType,
                drink,
                table: table._id,
                reservationTime,
                numberOfGuests
            });

            // mark table as occupied
            table.isFree = false;
            await table.save();

            res.status(201).json({
                message: "Reservation created successfully",
                reservation
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // GET all reservations
    getAllReservations: async (req, res) => {
        try {
            const reservations = await Reservation.find()
                .populate("customer")
                .populate("table");

            res.status(200).json({ reservations });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // GET reservations of logged-in user
    getMyReservations: async (req, res) => {
        try {
            const reservations = await Reservation.find({
                customer: req.user.id
            }).populate("table");

            res.status(200).json({ reservations });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // DELETE reservation
    deleteReservation: async (req, res) => {
        try {
            const reservation = await Reservation.findById(req.params.id);

            if (!reservation)
                return res.status(404).json({ message: "Reservation not found" });

            // free the table again
            if (reservation.table) {
                const table = await Table.findById(reservation.table);
                if (table) {
                    table.isFree = true;
                    await table.save();
                }
            }

            await reservation.deleteOne();

            res.status(200).json({ message: "Reservation deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = reservationController;
