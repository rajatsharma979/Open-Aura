import { Router } from "express";

import isAuthenticated from "../public/authentication.js";
import eventController from "../controller/eventController.js";

const router = Router();

router.get('/getEvents', isAuthenticated, eventController.getEvents);

router.post('/createEvent', isAuthenticated, eventController.postCreateEvent);


export default router;