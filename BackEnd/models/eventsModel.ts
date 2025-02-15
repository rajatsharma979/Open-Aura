import mongoose from "mongoose";
const Schema = mongoose.Schema;
const eventSchema = new Schema({
    eventHostId:{
        type: String,
        required: true
    },
    eventId:{
        type: String,
        required: true
    },
    eventHost:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    eventDate:{
        type: String,
        required: true
    },
    eventTime:{
        type: String,
        required: true
    }
});

export default mongoose.model('Events', eventSchema);
