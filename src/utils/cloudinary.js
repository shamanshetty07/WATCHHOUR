import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });


    const uploadOnCloudinary=async(localfilepath)=>{
        try{
            if(!localfilepath) return null
            //upload the file in the cloudinary
        const response=   await cloudinary.uploader.upload(localfilepath,{
                resource_type:"auto"
            })
            // file has been uploaded successfull
            console.log("file is uploaded in cloudinary",response.url);
            return response;
        }catch(error){
            fs.unlinkSync(localfilepath) // remove the locally saved temproray as the upload operation got failed
        }
    }


    export {uploadOnCloudinary}