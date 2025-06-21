import express, {Request, Response} from "express";
import { PrismaClient } from "../generated/prisma";
import cors from "cors";


const app = express();
const client = new PrismaClient();
app.use(express.json());
app.use(cors());

export async function createProject(req: Request, res: Response)  {
    try{
        //@ts-ignore
        const userId = req.id;
        //@ts-ignore
        const {name, description,public} = req.body;
        const user = await client.user.findUnique({where:{id: userId}});
        const userName = user?.username;

        //@ts-ignore
        await client.project.create({data: {name: userName + "/" + name, description, public, ownerId: userId}});

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed in createProject endpoint"})
    }
}

export async function projectCheck(req: Request, res: Response){
    try{
        //@ts-ignore
        const userId = req.id;
        const {name} = req.body;

        const user = await client.user.findUnique({where: {id: userId}});
        const username = user?.username;
        
        const projectCheck = await client.project.findFirst({where: {name: username + "/" + name}});
        if(projectCheck){
            res.status(403).json({message:"this project already exists"});
            return
        }
        else{
            res.status(201).json({message:"this project is available"});
            return
        }

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed projectCheck endpoint"})
    }
}

export async function getProjectByName(req: Request, res: Response){
    try{
        //@ts-ignore
        const userId = req.id
        const name = req.params.name;
        
        const project = await client.project.findFirst({where: {name: name}});

        if(project?.public == false && userId !== project.ownerId || !userId){
            res.status(403).json({message: "you dont have access to this project"});
            return
        }
        if(project?.public == true && userId !== project.ownerId || !userId){
            
        }

        
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed in getProjectById endpoint"})
    }
}