import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Suponiendo que tienes un modelo de usuario
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product', // Suponiendo que tienes un modelo de producto
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            totalProducto: {
                type: Number // Nuevo campo para el total del producto (price * quantity)
            }
        }
    ],
    totalGeneral: {
        type: Number // Nuevo campo para el total general del carrito
    }
});

export default mongoose.model('cart', cartSchema);