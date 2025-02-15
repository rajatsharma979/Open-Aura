import { Request, Response } from "express";
import crypto from "crypto";

import Events from "../models/eventsModel.js";
import { eventData, userData } from "../types/eventTypes";

const postCreateEvent = async (req: Request, res: Response)=>{

    try{
        const body = req.body as eventData;
        const user = req.user as userData; 

        const eventHostId = user.id;
        const eventHost = user.name;
        const eventId = crypto.randomUUID();
        const title = body.title;
        const description = body.description;
        const eventDate = body.eventDate;
        const eventTime = body.eventTime;
    
        const event = new Events({
            eventHostId: eventHostId,
            eventId: eventId,
            eventHost: eventHost,
            title: title,
            description: description,
            eventDate: eventDate,
            eventTime: eventTime
        });
    
        await event.save();
    
        res.status(200).json({'msg': 'Event created successfully'});
        return;
    }
    catch(error){
        console.log("Error creating event", error);
        res.status(500).json({'err': 'Error creating Event'});
    }
}

export default {
    postCreateEvent
}