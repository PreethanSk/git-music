import express from "express";
import { PrismaClient } from "../generated/prisma";
import cors from "cors";


const app = express();
const client = new PrismaClient();
app.use(express.json());
app.use(cors());


