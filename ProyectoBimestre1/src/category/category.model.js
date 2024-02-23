import mongoose, { trusted } from "mongoose";

const categorySchema = mongoose.Schema({
    nameCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export default mongoose.model('category',categorySchema)
