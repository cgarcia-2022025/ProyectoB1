'use strict'

import Product from '../Product/product.model.js'
import Cart from './cart.model.js'
import Invoice from '../invoice/invoice.model.js'
import jwt from "jsonwebtoken"
import fs from 'fs';
import PDFDocument from 'pdfkit';




export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Obtener la llave de acceso al token desde las variables de entorno
        let secretKey = process.env.SECRET_KEY;

        // Obtener el token de los headers
        let { authorization } = req.headers;

        // Verificar el token y obtener el uid
        let { uid } = jwt.verify(authorization, secretKey);

        // Buscar el carrito del usuario o crear uno nuevo si no existe
        let cart = await Cart.findOne({ user: uid })

        if (!cart) {
            cart = new Cart({
                user: uid,
                items: [],
                totalGeneral: 0
            });
        }

        // Verificar si el producto existe
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verificar si el producto ya está en el carrito
        const existingItem = cart.items.findIndex(item => item.product.toString() === productId);

        if (product.stock > 0) {
            // Restar uno al stock
            let updatedValue = product.stock - 1
            // Actualizar el stock
            let updatedProduct = await Product.findOneAndUpdate(
                { _id: productId },
                { $set: { stock: updatedValue } }, // Utilizar $set para actualizar solo el atributo especificado
                { new: true }
            ).populate('category', ['nameCategory'])
            // Validar la actualización
            if (!updatedProduct) {
                return res.status(404).send({ message: 'Product not updated' })
            }
        }

        if (existingItem !== -1) {
            // Si el producto ya está en el carrito, actualizar la cantidad
            cart.items[existingItem].quantity += quantity || 1;
        } else {
            // Si el producto no está en el carrito, agregarlo como un nuevo elemento
            cart.items.push({
                product: productId,
                quantity: quantity || 1,
                totalProducto: product.price * (quantity || 1)
            });
        }

        // Calcular el totalGeneral en el carrito usando un bucle for...of
        cart.totalGeneral = 0;
        for (let item of cart.items) {
            cart.totalGeneral += item.totalProducto || 0;
        }

        // Guardar el carrito actualizado
        await cart.save();

        res.status(201).json({ message: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};




export const getProductsCart = async (req, res) => {
    try {
        const productsCart = await Cart.find().populate({
            path: 'items.product',
            select: 'productName price -_id'
        }).populate({
            path: 'user',
            select: 'name username email -_id'
        });

        if (productsCart && productsCart.length > 0) {
            res.json({ productsCart })
        } else {
            return res.send({ message: 'No hay productos en el carrito' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener el carrito' });
    }
};



export const generateInvoice = async (req, res) => {
    try {
        let secretKey = process.env.SECRET_KEY;

        // Obtener el token de los headers
        let { authorization } = req.headers;

        // Verificar el token y obtener el uid
        let { uid, username } = jwt.verify(authorization, secretKey);
        const cart = await Cart.findOne({ user: uid }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Carrito vacío, no se puede generar la factura' });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        const invoiceFileName = `Factura_${Date.now()}.pdf`; 
        const invoicePath = `invoices/Factura_${Date.now()}.pdf`;// Nombre del archivo PDF
	   // Pipe the PDF directly to a file
  	 doc.pipe(fs.createWriteStream(invoicePath));
	
        // Pipe the PDF directly to the response stream
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoiceFileName}`);
        doc.pipe(res);

        // Agregar contenido al PDF
        doc.fontSize(15).text('Factura', { align: 'center' }).moveDown(0.5);
        doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' }).moveDown(0.5);

        // Información del usuario
        doc.fontSize(12).text(`Cliente: ${username}`);

        // Detalles del carrito
        doc.fontSize(12).text('Detalles del Pedido:', { underline: true }).moveDown(0.5);
        cart.items.forEach(item => {
            doc.fontSize(10).text(`- ${item.product.productName} ---- Q${item.product.price.toFixed(2)} x${item.quantity} - Sub-total: Q${item.totalProducto.toFixed(2)}`);
        });

        // Total general
        doc.moveDown(1);
        doc.fontSize(12).text(`Total: Q${cart.totalGeneral.toFixed(2)}`, { align: 'right' });

        // Nota adicional, si es necesario
        doc.moveDown(1);
        doc.fontSize(10).text('Gracias por su compra. Esperamos que su pedido sea de su agrado :).');

        // Termina el PDF
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar la factura' });
    }
};


export const getPurchasedProducts = async (req, res) => {
    try {
         // Obtener la llave de acceso al token desde las variables de entorno
         let secretKey = process.env.SECRET_KEY;
         // Obtener el token de los headers
         let { authorization } = req.headers;
         // Verificar el token y obtener el uid
         let { uid } = jwt.verify(authorization, secretKey); 
        // Buscar el carrito del usuario por su uid y popular los detalles del producto
        const cart = await Cart.findOne({ user: uid }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos comprados para este usuario' });
        }

        // Extraer detalles del producto del carrito
            // El .map itera sobre el array para llamar a los productos
        const purchasedProducts = cart.items.map(item => {
            return {
                productName: item.product.productName,
                price: item.product.price,
                quantity: item.quantity,
                totalProduct: item.totalProducto
            };
        });

        res.json({ purchasedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos comprados' });
    }
};



export const removeFromCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Obtener la llave de acceso al token desde las variables de entorno
        let secretKey = process.env.SECRET_KEY;

        // Obtener el token de los headers
        let { authorization } = req.headers;

        // Verificar el token y obtener el uid
        let { uid } = jwt.verify(authorization, secretKey);

        // Buscar el carrito del usuario
        let cart = await Cart.findOne({ user: uid });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Encontrar el índice del producto en el carrito
        const productIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Obtener información del producto
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Sumar la cantidad especificada al stock del producto
        const updatedStock = product.stock + quantity;

        // Actualizar el stock del producto en la base de datos
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            { $set: { stock: updatedStock } },
            { new: true }
        ).populate('category', ['nameCategory']);

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Error al actualizar el stock del producto' });
        }

        // Restar la cantidad del producto del carrito
        const updatedQuantity = cart.items[productIndex].quantity - quantity;

        // Si la cantidad es igual o menor a 0, eliminar el producto del carrito
        if (updatedQuantity <= 0) {
            cart.items.splice(productIndex, 1);
        } else {
            // Actualizar la cantidad y el total del producto en el carrito
            cart.items[productIndex].quantity = updatedQuantity;
            cart.items[productIndex].totalProducto = product.price * updatedQuantity;
        }

        // Recalcular el totalGeneral en el carrito usando un bucle for...of
        cart.totalGeneral = 0;
        for (let item of cart.items) {
            cart.totalGeneral += item.totalProducto || 0;
        }

        // Guardar el carrito actualizado
        await cart.save();

        res.status(200).json({ message: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};




