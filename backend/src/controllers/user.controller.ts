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

export async function uploadProfilePicture(req: Request, res: Response) {
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
}

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
      where: { OR: [{ username: username }, { email: email }] },
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

export async function usernameCheck(req: Request, res: Response) {
  try {
    const { username } = req.body;
    if (!username) {
      res.status(403).json({ message: "enter a username" });
      const check = await client.user.findUnique({ where: { username } });
      if (check) {
        res.status(403).json({ message: "this user already exists" });
        return;
      } else {
        res.status(201).json({ message: "this username is available" });
        return;
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, message: "Server crash in usernameCheck endpoint" });
  }
}

// implement google signin singup when doing frontend

export async function userSignin(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;
    const zodParse = userSigninSchema.safeParse(req.body);
    if (!zodParse.success) {
      res.json({ error: zodParse.error.errors });
      return;
    }
    const findUser = await client.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (!findUser) {
      res.status(403).json({ message: "this user does not exist" });
      return;
    }
    const passwordVerify = await bcrypt.compare(password, findUser.password);
    if (!passwordVerify) {
      res.status(403).json({ message: "username or password incorrect" });
      return;
    }

    const token = jwt.sign({ id: findUser.id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "signin successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error in user signin", error });
  }
}

export async function dashboardProfile(req: Request, res: Response) {
  try {
    //@ts-ignore
    const id = req.id;
    const profile = await client.user.findFirst({
      where: { id: id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        pfpUrl: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, message: "server crashed in profile page endpoint" });
  }
}

export async function dashboardProjects(req: Request, res: Response) {
  try {
    //@ts-ignore
    const id = req.id;
    const projects = await client.project.findMany({
      where: {
        ownerId: id,
        isActive: true,
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        lastCommit: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!projects.length) {
      res.status(403).json({ message: "you dont have any projects" });
      return;
    }
    res.json({ projects });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, message: "server crashed in selfProjects endpoint" });
  }
}

export async function dashboardCommits(req: Request, res: Response) {
  try {
    //@ts-ignore
    const id = req.id;
    const { year } = req.query;

    const selectedYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);

    // First get all projects owned by the user
    const userProjects = await client.project.findMany({
      where: { ownerId: id },
      select: { id: true },
    });

    if (!userProjects.length) {
      return res
        .status(404)
        .json({ message: "No projects found for this user" });
    }

    const projectIds = userProjects.map((project) => project.id);

    const commits = await client.commit.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!commits.length) {
      return res
        .status(404)
        .json({ message: "No commits found for this year" });
    }

    res.json({ commits });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, message: "server crashed in selfCommits endpoint" });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    //@ts-ignore
    const id = req.id;
    const { username, name, pfpUrl, bio } = req.body;
    const checkUser = await client.user.findUnique({ where: { username } });
    if (checkUser) {
      res.status(403).json({ message: "user already exists" });
      return;
    }
    await client.user.updateMany({
      where: { id: id },
      data: { username, name, pfpUrl, bio },
    });
    res.json({ message: "user updated successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, message: "server crash in update profile endpoint" });
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    //@ts-ignore
    const id = req.id;
    const { currentPassword, newPassword } = req.body;
    const passwordVerify = await bcrypt.compare(currentPassword, id.password);
    if (!passwordVerify) {
      res.status(403).json({ message: "invalid password" });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await client.user.update({
      where: { id },
      data: { password: passwordHash },
    });
    res.json({ message: "password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: "Server crash in update password" });
  }
}

export async function userLogout(req: Request, res: Response) {
  try {
    //@ts-ignore
    const id = req.id;
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Server crashed in logout endpoint", error });
  }
}
