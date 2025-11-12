const feedbackSchema = require('../Models/feedbackModel');

const feedbackController = {

    submitFeedback: async(req,res)=>{
        try{
            const {userId, message, rating} = req.body;
            const newFeedback = new feedbackSchema({
                userId: userId,
                message: message,
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
                { message, rating },
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