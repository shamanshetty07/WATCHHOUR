import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export  const verifyJWT = asyncHandler(async(req,res,next)=>{
try {
      const token= req.cookies?.acessToken || req.header('Authorization')?.replace("Bearer","")
      if(!token){
         throw new ApiError(401,"unauthorized request")
      }
      
     const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
    const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      //about the frontend
      throw new ApiError(401,"Invakid Acess Token")
    }
    req.user=user;
    next()
} catch (error) {
  throw new ApiError(401,error?.message || "Inavalid acess token")
   
}


})
