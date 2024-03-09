import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    nameCategory: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export default mongoose.model('category',categorySchema)
