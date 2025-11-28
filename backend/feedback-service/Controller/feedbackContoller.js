const feedbackSchema = require('../Model/Feedback');
const axios = require('axios')

async function getUserData(userId){
    try{
        const response = await axios.get(
            `http://localhost:3000/api/v1/internal/users/${userId}`,
            {headers: {"x-secret-code": process.env.SERVICE_SECRET}}
        )
        return response.data.User
    }
    catch(e){
        console.log("Error fetching user data:",e)
    }
}
const feedbackController = {

    submitFeedback: async(req,res)=>{
        try{
            const user = await getUserData(req.user.id)
            const {message, rating} = req.body;
            if(!user){
                return res.status(404).json({message: "User not found!"})
            }
            const newFeedback = new feedbackSchema({
                userId: user._id,
                description: message,
                rating: rating
            });
            await newFeedback.save();
            return res.status(200).json({message: "Feedback submitted successfully!", newFeedback});
        }catch(error){
            return res.status(500).json({message: "Error submitting feedback", error});
        }
    },

    updateFeedback: async(req,res)=>{
        try{
            const {feedbackId} = req.params;
            const {message, rating} = req.body;
            const updatedFeedback = await feedbackSchema.findByIdAndUpdate(
                feedbackId,
                { description, rating },
                { new: true }
            );
            return res.status(200).json({message: "Feedback updated successfully!", updatedFeedback});
        }catch(error){
            return res.status(500).json({message: "Error updating feedback", error});
        }
    },

    deleteFeedback: async(req,res)=>{
        try{
            const {feedbackId} = req.params;
            await feedbackSchema.findByIdAndDelete(feedbackId);
            return res.status(200).json({message: "Feedback deleted successfully!"});
        }catch(error){
            return res.status(500).json({message: "Error deleting feedback", error});
        }
    },

    getAllFeedback: async(req,res)=>{
        try{
            const feedbacks = await feedbackSchema.find();
            return res.status(200).json({feedbacks});
        }catch(error){
            return res.status(500).json({message: "Error retrieving feedbacks", error});
        }
    }

}

module.exports = feedbackController;