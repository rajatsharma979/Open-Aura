import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authenticationRoutes from './routes/authenticationRoutes.js';

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true               // allow cookies
}));

app.use(authenticationRoutes);

mongoose.connect(process.env.Db_Link!)
.then(()=>{
    app.listen(process.env.Port || 8000, (err)=>{
        if(!err){
            console.log("server listening at port 3000");
        }
        else{
            console.log("Error initiating server");
        }
    })
})
.catch(err=>{
    console.log("Error connecting database", err);
})


