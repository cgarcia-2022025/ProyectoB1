import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        minLength:[6, 'Password must be 6 characters'],
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['ADMIN','CLIENT'],
        required: true
    }
    
})

//pre mongoose
                            //pluralizar
export default mongoose.model('user',userSchema)