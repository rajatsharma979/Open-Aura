import {Router, Request, Response } from "express";
import http from "http";

import eventController from "../controller/eventController.js";
import isAuthenticated from "../public/authentication.js";

const router = Router();

const mediasoupFunction = (server: http.Server)=>{

    router.post('/startBroadcasting', isAuthenticated, (req: Request, res: Response)=>{
         eventController.startBroadcasting(req, res, server);
    });

    return router;
}
    

export default mediasoupFunction;
