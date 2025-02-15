import { Router } from "express";
import { Request, Response } from "express";

import isAuthenticated from "../public/authentication";
import eventController from "../controller/eventController";

const router = Router();

router.get('/createEvent', isAuthenticated, eventController.getCreateEvent);

router.post('/createEvent', isAuthenticated, eventController.postCreateEvent);


export default router;