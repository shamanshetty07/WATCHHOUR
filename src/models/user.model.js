import mongoose from "mongoose";

const { Schema } = mongoose;
import jwt from "jsonwebtoken";    // jwt is bearer token // mostly used for authorization and etc
import bcrypt from "bcrypt"           // used to store hashed password in the database

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
           type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,

    },
    fullname:{
            type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,   //cloudinary url   //here it stores the url of the image if you want you store the whole image then the databse will be heavy and db will becmke slow
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String
    }

    },{
        timestamps:true         //is used to upfate in the database when user has created account and when he updated bcz its useful for useful for the security etc 
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return ;
    this.password=await bcrypt.hash(this.password,10)
    

})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.genrateAccessToken=function(){
  return  jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }

)
}
userSchema.methods.genrateRefreshToken=function(){
      return  jwt.sign({
        _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }

)
}
export const User=mongoose.model("User",userSchema)

