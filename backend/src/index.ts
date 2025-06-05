import express from "express";
import cors from "cors";
import userRouter from "./routes/user.router";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(userRouter);


app.listen(3000, '0.0.0.0');
