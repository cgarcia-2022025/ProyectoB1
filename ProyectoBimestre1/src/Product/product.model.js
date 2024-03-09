import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    brand: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    stock: {
        type: Number,
        required: true
    }
}) 

export default mongoose.model('product',productSchema)