const tableSchema = require('../Model/Table');
const axios = require('axios');

async function getReservationData(reservationId) {
    try{
        const response = await axios.get(
            `http://localhost:3004/api/v1/internal/reservations/${reservationId}`,
            {headers: {"x-secret-code": process.env.RESERVATION_SERVICE_SECRET}}
        )
        return response.data.Reservation
    }
    catch(error){
        console.log("Error fetching reservation  data", error)
    }
}

const tableController = {

    createTable: async (req, res)=>{
        try{
            if (Array.isArray(req.body)) {
                const tables = await tableSchema.insertMany(req.body);
                return res.status(201).json({message: "Tables created successfully", tables});
            } 
            else {
                const {seatingType} = req.body;
                const newTable = new tableSchema({
                    seatingType: seatingType,
                });
                await newTable.save();
                return res.status(201).json({message: "Table created successfully", newTable});
            }
            
        }
        catch(error){
            return res.status(500).json({message: "Error creating table", error});
        }
    },

    updateTable: async(req, res)=>{
        try{
            const {tableId}= req.params;
            const {isFree, seatingType, reservation}= req.body;

            const updatedTable= await tableSchema.findByIdAndUpdate(
                tableId,
                {isFree, seatingType, reservation},
                {new: true},
            );

            return res.status(200).json({message: "Table updated sucessfully", updatedTable});
        }
        catch(error){
            return res.status(500).json({message: "Error updated table", error});
        }
    },

    deleteTable: async(req, res)=> {

        try{
            const {tableId} = req.params;
            await tableSchema.findByIdAndDelete(tableId);
            return res.status(200).json({ message: "Table deleted sucessfully"});
        }
        catch(error){
            return res.status(500).json({message: "Error deleteding table", error});
        }
    },

    getAllTables: async(req, res)=> {
        
        try{
            const tables= await tableSchema.find();
            return res.status(200).json({tables})
        }
        catch(error){            
            return res.status(500).json({message: "Error retrieving table", error});
        }

    },

    getTableById: async(req,res)=>{
        try{
            const {tableId} = req.params;
            const table = await tableSchema.findById(tableId);
            
            if(!table){
                return res.status(404).json({message: "Table not found!"});
            }
            
            return res.status(200).json({table});
        }
        catch(error){
            return res.status(500).json({message: "Error retrieving table", error});
        }
    },

    getAvailableTables: async(req,res)=>{
        try{
            const tables = await tableSchema.find({isFree: true});
            return res.status(200).json({tables});
        }
        catch(error){
            return res.status(500).json({message: "Error retrieving available tables", error});
        }
    },

    updateTableStatus: async(req,res)=>{
        try{
            const {tableId} = req.params;
            const {isFree} = req.body;
            
            const updatedTable = await tableSchema.findByIdAndUpdate(
                tableId,
                { isFree },
                { new: true }
            );
            
            return res.status(200).json({message: "Table status updated successfully!", updatedTable});
        }
        catch(error){
            return res.status(500).json({message: "Error updating table status", error});
        }
    },

}

module.exports = tableController;