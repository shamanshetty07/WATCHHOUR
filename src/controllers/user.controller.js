import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";

import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const generateAcessAndRefreshTokens=async(userId)=>{
  try{
   const user= await User.findById(userId)
 const acessToken=  user.genrateAccessToken()
 const refereshToken=user.genrateRefreshToken()
 user.refreshToken=refereshToken;
 await user.save({validateBEforeSave: false})
 return {acessToken,refereshToken}
  }catch(error){
    throw new ApiError(500,"something went while genrating access and refersh token")
  }
}
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
        // console.log("email:",email);
        if(fullname===""){
                throw new ApiError(400,"fullname is required")
        }

        if([fullname,email,username,password].some((field)=>
                field?.trim()==="")){
                        throw new ApiError(400,"All fields are required")
        }
        const existedUser= await User.findOne({
                $or:[{username},{email}]})


        if(existedUser){
                throw new ApiError(409,"User with email or username already exists")
        }
        console.log(req.files)
      const avatarLocalPath=  req.files?.avatar[0]?.path
//       const coverImageLocalPath=req.files?.coverImage[0]?.path;
      let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
      }
      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");

      }

      const avatar= await uploadOnCloudinary(avatarLocalPath)
      const coverImage=await uploadOnCloudinary(coverImageLocalPath)

      if(!avatar){
        throw new ApiError(400,"Avatar file is required")
      }
    const newUser=await   User.create({
        fullname,
        username,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password
      })

     const createdUser=await User.findById(newUser._id).select(
        "-password -refreshToken"
     )
     if(!createdUser){
        throw new ApiError(500,"something went wrong")
     }
     return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered suceessfully")
     )
})


const loginuser=asyncHandler(async(req,res)=>{
  //req body->date
  //username or email
  // find the user
  //password check
  //acess and referesh token
  //send cookie(secure)


  const{email,username,password}=req.body


  if(!(username || email)){
    throw new ApiError(400,"username or email is required")
  }
  const user=await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"user does not exist")
  }


  const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
  throw new ApiError(401,"invalid user credentials")
}

const{ acessToken,refereshToken}=await  generateAcessAndRefreshTokens(user._id);

 const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

 const options={

  httpOnly:true,
  secure:true
 }
 return res.status(200).cookie("acessToken",acessToken,options).cookie("refreshToken",refereshToken,options)
 .json(
  new ApiResponse(
    200,{
      user: loggedInUser,acessToken,refereshToken
    },
    "User logged in successfully"
  )
)
})
const logoutUser=asyncHandler(async(req,res)=>{
     await  User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refereshToken:undefined
          }
        },{
          new:true
        }
      )
      const options={
        httpOnly:true,
        secure:true

      }
      return res.status(200).clearCookie("acessToken",options)
      .clearCookie("refereshToken",options)
      .json(new ApiResponse(200,{},"User logged Out"))
})


const refreshAcessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refereshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }

try {
    const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET
    )
  
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
  if(incomingRefreshToken!==user?.refereshToken){
    throw new ApiError(401,"invalid refresh token")
  
  }
  const options={
    httpOnly: true,
    secure: true
  }
  
  const {acessToken,newRefreshToken}=await generateAcessAndRefreshTokens(user._id)
  
  return res.status(200).cookie("accessToken",acessToken,options).cookie("refreshToken",newRefreshTokenrefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {acessToken,refreshToken: newRefreshToken},
        "Acess token refreshed"
      )
    )
} catch (error) {
  throw new ApiError(401,error?.message || "invalid refresh token")
}
})


const changeCurrentPassword= asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

   const user=await User.findById(req.user?._id)
   const isPasswordCorrect=user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
    throw new ApiError(400,"invalid old password")
   }

   user.password=newPassword
   await user.save({validateBEforeSave:flase})

   return res.status(200).json(new ApiResponse(200,{},"password changed successfully"))
})
const  getCurrentUser= asyncHandler((req,res)=>{
  return res.status(200)
  .json(200,req.user,"current user fetched successfully")
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
        const {fullname,email}=req.body;
        if(!fullname || !email){
          throw new ApiError(400,"All fields are registered")
        }
      const user=  User.findByIdAndUpdate(req.user?._id,{$set:{
        fullname,
        email
      }},{new:true}).select("-password")

      return res.status.json(new ApiResponse(200,user,"Account details upadted succcessfully"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path


  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is missing")
  }
 const avatar=await uploadOnCloudinary(avatarLocalPath)
 if(!avatar.url){
  throw new ApiError(400,"Error while uploading on avatar")
 }
const user= await User.findByIdAndUpdate(
  req.user?._id,
  {$set:{
    avatar:avatar.url
  }},
  {new:true}
 ).select("-password")
  return res.status(200).json(200,user,"Avatar image updated successfully")
})


const updateCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400,"coverImage file is missing")
  }
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading the coverImage")
  }
 const user= await User.findByIdAndUpdate(
    req.user?._id,
    {$set:{
      coverImage:coverImage.url
    }},{new:true}
  ).select("-password")
  return res.status(200).json(200,user,"Cover image updated successfully")
})
export {registerUser,loginuser,logoutUser,refreshAcessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateCoverImage}