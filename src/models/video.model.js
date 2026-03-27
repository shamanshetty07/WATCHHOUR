import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // when you usually ask for anything you will evrethingh at once but pagination will aloow you send some chunks at once not all at once like 10 videos in page 1 and 10 more in page 2 

const videoSchema=new Schema({
    videoFile:{
        type:String,  //cloudinary url
        requierd:true,
    },
    thumbnail:{
                type:String,  //cloudinary url
        requierd:true,
    
    },
    title:{
                type:String, 
        requierd:true,
    },
    description:{
                type:String,  
        requierd:true,
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:true,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)    //you dont use plugin when you directly some function you only use it when you need to change the behaviour of the cetain function sometimes you can just import it and leave it just use the functions directly


export const Video=mongoose.model("Video",videoSchema)