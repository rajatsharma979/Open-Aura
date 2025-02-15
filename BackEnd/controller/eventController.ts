import { Request, Response } from "express";
import crypto from "crypto";

import Events from "../models/eventsModel";
import { eventData, userData } from "../types/eventTypes";

const getCreateEvent = (req: Request, res: Response)=>{

    try{
        const eventId = crypto.randomUUID();
        res.status(200).json({eventId: eventId});
    }
    catch{
        console.log('Error generating eventId');
        res.status(500).json({"error": "Error generating eventId"});
    }
}

const postCreateEvent = async (req: Request, res: Response)=>{

    try{
        const body = req.body as eventData;
        const user = req.user as userData; 
    
        const eventHostId = user.id;
        const eventHost = user.name;
        const eventId = body.eventId;
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
    catch{
        console.log("Error creating event");
        res.status(500).json({'err': 'Error creating Event'});
    }
}

export default {
    getCreateEvent,
    postCreateEvent
}