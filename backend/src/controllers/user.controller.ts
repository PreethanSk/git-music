import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import cors from "cors";
import { JWT_KEY } from "../utils/config";
import bcrypt from "bcrypt";
import { userSignupSchema, userSigninSchema } from "../utils/zod";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = JWT_KEY || "default-key";
const client = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

//ensure upload directory exists, if not create one
const uploadsDir = path.join(
  __dirname,
  "../../public/uploads/profile-pictures"
);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Using diskStorage to save files to the local server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Save files to 'public/uploads/profile-pictures'
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: fieldname-timestamp-randomnumber.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to ensure only images are uploaded
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Not an image! Please upload only images.")); // Reject file
  }
};

// Multer instance configured for single file uploads
// 'profilePicture' will be the field name expected in the multipart/form-data request
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// --- Helper Function for Local File URL ---

/**
 * For local development, this function returns the local URL path to the file.
 * @param file The file object from Multer (Express.Multer.File)
 * @returns A promise that resolves to the public URL path of the uploaded file.
 */
const getLocalFileUrlPath = async (
  file: Express.Multer.File
): Promise<string> => {
  const fileName = file.filename;
  console.log(`File saved locally as: ${fileName} at ${file.path}`);
  // Construct the URL path relative to the directory you serve statically (e.g., 'public')
  const urlPath = `/uploads/profile-pictures/${fileName}`;
  console.log(`Generated local URL path: ${urlPath}`);
  return urlPath;
};


export const uploadProfilePicture = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded. Please select a profile picture to upload.",
    });
  }

  try {
    const fileUrlPath = await getLocalFileUrlPath(req.file);

    res.status(200).json({
      message: "Profile picture uploaded successfully!",
      pfpUrl: fileUrlPath, // This is the URL path you would save / use locally
    });
  } catch (error: any) {
    console.error("Error during profile picture upload processing:", error);
    if (error.message === "Not an image! Please upload only images.") {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: error.message || "Server error during file upload." });
  }
};


export async function userSignup(req: Request, res: Response) {
  try {
    const { email, username, name, password, pfpUrl } = req.body;
    // get url from the pfp controller and paste it here
    const zodParse = userSignupSchema.safeParse(req.body);
    if (!zodParse.success) {
      res.status(403).json({ error: zodParse.error.errors });
      return;
    }
    const userCheck = await client.user.findFirst({
      where: {OR: [ { username: username }, { email: email }]}
    });
    if (userCheck) {
      res.status(403).json({ message: "user already exists" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await client.user.create({
      data: { email, username, name, password: passwordHash, pfpUrl },
    });
    res.json({ message: "user created successfully!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e, message: "server crashed in signup endpoint" });
  }
}

// implement google signin singup when doing frontend

export async function userSignin(req: Request, res: Response){
    try{
        const {email, username, password} = req.body;
        const zodParse = userSigninSchema.safeParse(req.body);
        if(!zodParse.success){
            res.json({error: zodParse.error.errors});
            return
        }
        const findUser = await client.user.findFirst({where: {OR: [{username}, {email}]}})
        if(!findUser){
            res.status(403).json({message:"this user does not exist"});
            return
        }
        const passwordVerify = await bcrypt.compare(password, findUser.password);
        if(!passwordVerify){
            res.status(403).json({message:"username or password incorrect"});
            return
        }

        const token = jwt.sign({id: findUser.id}, JWT_SECRET)
        res.cookie("token", token, {httpOnly: true});
        res.json({message:"signin successful"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server error", error});
    }
}

