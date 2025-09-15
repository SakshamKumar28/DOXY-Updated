import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    phoneNumber:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    age:{
        type: Number,
        required: true,
    },
    address : {
        type: String,
        trim: true,
    }

}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;

