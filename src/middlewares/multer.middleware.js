import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // this is used to genrate file name for every file you upload
    cb(null, file.originalname)
  }
})

 export const upload = multer({ storage,})