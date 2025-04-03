import express from "express";
import {Request, Response} from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import multer from "multer";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mediasoup from 'mediasoup';
import { Worker } from "mediasoup/node/lib/types";
import dotenv from "dotenv";
dotenv.config();

import authenticationRoutes from './routes/authenticationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { mediasoupStartFunction } from './routes/mediasoupCreation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true               // allow cookies
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"]
    }
});

let worker;

(async()=>{
    try{
        worker = await mediasoup.createWorker();
        console.log('Mediasoup Worker created');
    }
    catch(error){
        console.log('Error creating worker');
    }
})();

//mediasoupRouting(server);



console.log(__dirname);

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use('/thumbnails', express.static(path.join(__dirname, '../', 'thumbnails')));

app.use(authenticationRoutes);
app.use(eventRoutes);
app.use('/startEvent', mediasoupStartFunction(io, worker!));

mongoose.connect(process.env.Db_Link!)
.then(()=>{
    server.listen(process.env.Port || 8000, ()=>{
        console.log(`server listening at port ${process.env.Port}` );
    })
})
.catch(err=>{
    console.log("Error connecting database", err);
})


