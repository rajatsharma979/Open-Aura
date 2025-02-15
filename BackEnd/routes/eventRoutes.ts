import { Router } from "express";
import { Request, Response } from "express";

import isAuthenticated from "../public/authentication.js";
import eventController from "../controller/eventController.js";

const router = Router();

router.post('/createEvent', isAuthenticated, eventController.postCreateEvent);


export default router;