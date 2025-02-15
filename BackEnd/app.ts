import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authenticationRoutes from './routes/authenticationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import mediasoupRouting from './public/mediasoupRouting.js';

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true               // allow cookies
}));

const server = http.createServer(app);
mediasoupRouting(server);

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());


app.use(authenticationRoutes);
app.use(eventRoutes);

mongoose.connect(process.env.Db_Link!)
.then(()=>{
    server.listen(process.env.Port || 8000, ()=>{
        console.log(`server listening at port ${process.env.Port}` );
    })
})
.catch(err=>{
    console.log("Error connecting database", err);
})


