import {Router} from "express"
import { loginuser, registerUser ,logoutUser,refreshAcessToken} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router=Router()

router.route("/register").post(
    upload.fields([{name:"avatar",
        maxCount:1

    },{name:"coverImage",
        maxCount:1
    }]),
    registerUser)
    router.route("/login").post(loginuser)

    //secured routes
    router.route("/logout").post(verifyJWT,logoutUser)
    router.route("/refresh_token").post(refreshAcessToken)                               //if any error shows up first check this
export default router
