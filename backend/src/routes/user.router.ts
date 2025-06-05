import { Router, Request, Response, NextFunction } from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import {  uploadProfilePicture,userSignup,  usernameCheck,userSignin,  dashboardProfile,  dashboardProjects, dashboardCommits,updateProfile,  updatePassword,userLogout,} from "../controllers/user.controller";

const userRouter = Router();
const api = "/api";

const asyncHandler =(fn: (req: Request, res: Response) => Promise<any>) =>(req: Request, res: Response, next: NextFunction) =>
Promise.resolve(fn(req, res)).catch(next);

userRouter.post(api + "/uploadProfilePicture",asyncHandler(uploadProfilePicture));
userRouter.post(api + "/userSignup", asyncHandler(userSignup));
userRouter.get(api + "/usernameCheck", asyncHandler(usernameCheck));
userRouter.post(api + "/userSignin", asyncHandler(userSignin));
userRouter.get( api + "/dashboardProfile",  userMiddleware,  asyncHandler(dashboardProfile));
userRouter.get(api + "/dashboardProjects", userMiddleware,asyncHandler(dashboardProjects));
userRouter.get(api + "/dashboardCommits",  userMiddleware,  asyncHandler(dashboardCommits));
userRouter.put(api + "/updateProfile",userMiddleware,asyncHandler(updateProfile));
userRouter.put(api + "/updatePassword",userMiddleware,asyncHandler(updatePassword));
userRouter.post(api + "/userLogout", userMiddleware, asyncHandler(userLogout));

export default userRouter;
