export const delroute = (req, res, next)=>{
    console.log("---------------------><")
    return next(CustomSuccess.createSuccess("", "Conversation", 200));
}