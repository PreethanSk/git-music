import { Router, Request, Response, NextFunction } from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import {createProject, projectCheck} from "../controllers/project.controller";

const projectRouter = Router();
const api = "/api";

const asyncHandler =(fn: (req: Request, res: Response) => Promise<any>) =>(req: Request, res: Response, next: NextFunction) =>
Promise.resolve(fn(req, res)).catch(next);

projectRouter.post(api + "/createProject", userMiddleware, asyncHandler(createProject));
projectRouter.get(api + "/projectCheck", userMiddleware, asyncHandler(projectCheck));



export default projectRouter