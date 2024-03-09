import Compra from './invoice.model.js'
import Cart from '../cart/cart.model.js';
import jwt from 'jsonwebtoken';



export const pagar = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token
        let secretKey = process.env.SECRET_KEY;

        // Obtener el token de los headers
        let { authorization } = req.headers;

        // Verificar el token y obtener el uid
        let { uid } = jwt.verify(authorization, secretKey);

        // Obtener los productos en el carrito del usuario
        let carrito = await Cart.findOne({ user: uid })


        // Verificar si el carrito está vacío
        if (!carrito || carrito.items.length === 0) {
            return res.status(400).send({ message: 'No hay productos en el carrito' });
        }

        // Calcular el total de la compra
        let total = 0;
        for (let item of carrito.items) {
            total += item.totalProducto || 0;

        }

        // Verificar disponibilidad de stock para cada producto en el carrito
        for (let item of carrito.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).send({ message: `No hay suficiente stock para el producto` });
            }

        }

        let compra = new Compra({
            user: uid,
            carrito: carrito._id,
            items: carrito.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                totalProducto: item.totalProducto
            })),
            totalGeneral: total
        });
        await compra.save();

        // Limpiar el carrito del usuario
        await Cart.updateOne({ user: uid }, { $set: { items: [] } })

        return res.status(200).send({ message: 'Pago procesado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al procesar el pago' });
    }
};



        export const getInvoicesOfUser = async(req, res)=>{
            try{
                //Obtener el parámetro de búsqueda
                let { search } = req.body
                //Buscar
                let invoice = await Compra.find(
                    {user: search}
                )
                //Validar la respuesta
                if(!invoice) return res.status(404).send({message: 'product not found'})
                //Responder si todo sale bien
                return res.send({message: 'product found', invoice})
            }catch(err){
                console.error(err)
                return res.status(500).send({message: 'Error searching product'})
            }
        }
