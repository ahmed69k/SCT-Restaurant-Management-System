module.exports = function serviceAuthMiddleware(req,res,next){
    const secret = req.headers['x-secret-code']
    if(!secret || secret != process.env.USER_SERVICE_SECRET)
        return res.status(403).json({message: "Forbidden: Invalid Service Secret!"})
    next();
}