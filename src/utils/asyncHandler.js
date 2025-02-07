// const asyncHandle=(requestHandler)=>{
//     return (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next))
//         .catch((error)=>next(error))
//     }
// }




const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export { asyncHandler };
