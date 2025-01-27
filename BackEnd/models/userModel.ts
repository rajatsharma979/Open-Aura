import mongoose from "mongoose";
const Schema = mongoose.Schema;
const user = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    refreshToken:{
        type: String
    }
});

export default mongoose.model('Users', user);