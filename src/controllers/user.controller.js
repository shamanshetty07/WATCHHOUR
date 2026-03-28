import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";

import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser=asyncHandler(async(req,res)=>{
        //get user deatils from frontend
        //validation - not empty
        //check of user already exists: username,email
        //check for the images,check for avatar
        //upload them to cloudinary, avatar
        //create user object - create entry in db 
        // remove password and refresh token field from the response
        // check for the user creation
        // return response
        

        const{fullname,email,username,password}=req.body
        console.log("email:",email);
        if(fullname===""){
                throw new ApiError(400,"fullname is required")
        }

        if([fullname,email,username,password].some((field)=>
                field?.trim()==="")){
                        throw new ApiError(400,"All fields are required")
        }
        const existedUser=User.findOne({
                $or:[{username},{email}]})


        if(existedUser){
                throw new ApiError(409,"User with email or username already exists")
        }
      const avatarLocalPath=  req.files?.avatar[0]?.path
      const coverImageLocalPath=req.files?.coverImage[0]?.path;
      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");

      }

      const avatar= await uploadOnCloudinary(avatarLocalPath)
      const coverImage=await uploadOnCloudinary(coverImageLocalPath)

      if(!avatar){
        throw new ApiError(400,"Avatar file is required")
      }
    await   User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password
      })

     const createdUser=await User.findById(User._id).select(
        "-password -refreshToken"
     )
     if(!createdUser){
        throw new ApiError(500,"something went wrong")
     }
     return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered suceessfully")
     )
})
export {registerUser}