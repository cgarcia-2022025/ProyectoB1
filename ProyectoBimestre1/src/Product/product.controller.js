'use strict'

import Product from './product.model.js'
import { checkUpdate } from '../utils/validator.js'
import Cart from '../cart/cart.model.js'
import Invoice from '../invoice/invoice.model.js'

export const testProduct = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is runnign'})
}

export const registerProduct = async(req, res)=>{
    try{
        let data = req.body
        console.log(data)
        let product = new Product(data)
        await product.save()
        return res.send({message: `The product has been registered`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message:'Error, cannot register the product'})
    }
}

//Update


//Delete

export const deleteProduct = async(req, res)=>{
    try{
        // Obtener el Id
        let { id } = req.params
        // Validar si esta logueado y es el mismo X No lo vemos hoy X
        // Eliminar (deleteOne / findOneAndDelete)
        let deleteProducts  = await Product.findOneAndDelete({_id: id})
        // Verificar que se elimino
        if(!deleteProducts) return res.status(404).send({message: 'Product not found and not deleted'})
        // Responder
        return res.send({message: `the product has been deleted succesfully`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting product'})
    }
}


//view all products

export const getProduct = async (req, res) => {
    try {
        let product = await Product.find().populate('category', ['nameCategory'])
        return res.send({product})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error '})
    }
}

export const productsOutOfStock = async (req, res) => {
    try {
        let products = await Product.find().populate('category', ['nameCategory'])
//crea un nuevo array (outOfStockProducts) que contiene solo aquellos productos del array original (products) cuyo stock es igual a cero.
        //filter():Es un método de array en JavaScript que crea un nuevo array con todos los elementos que pasan la prueba implementada por la función proporcionada.
        let outOfStockProducts = products.filter(product => product.stock == 0) 

        if(outOfStockProducts.length > 0){
        return res.send({outOfStockProducts })
    }else {return res.status(404).send({message: 'No hay productos agotados'})}
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error '})
    }
}


export const seeOneProduct = async(req, res)=>{
    try{
        //Obtener el parámetro de búsqueda
        let { search } = req.body
        //Buscar
        let products = await Product.find(
            {productName: { $regex: search, $options: 'i' }}
        ).populate('category', ['nameCategory'])
        //Validar la respuesta
        if(!products) return res.status(404).send({message: 'product not found'})
        //Responder si todo sale bien
        return res.send({message: 'product found', products})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching product'})
    }
}


export const seeProductsForCategory = async(req, res)=>{
    try{
        //Obtener el parámetro de búsqueda
        let { search } = req.body
        //Buscar
        let products = await Product.find(
            {category: search}
        ).populate('category', ['nameCategory'])
        //Validar la respuesta
        if(!products) return res.status(404).send({message: 'product not found'})
        //Responder si todo sale bien
        return res.send({message: 'product found', products})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching product'})
    }
}

export const update = async (req, res) => {
    try {
        //Capturar la data
        let data = req.body
        //Capturar el id del animal a actualizar
        let { id } = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        //Actualizar
    let updatedProduct = await Product.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
        ).populate('category', ['nameCategory'])//Eliminar la información sensible
        //Validar la actualización
        if(!updatedProduct) return res.status(404).send({message: 'Product not found and not updated'})
        //Responder si todo sale bien
        return res.send({message: 'Product updated successfully', updatedProduct})
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating product' })
    }
}


export const restStock = async (req, res) => {
    try {
        // Capturar el id del animal a actualizar
        let { productId } = req.body   
        // Obtener el valor actual del atributo
        let existingProduct = await Product.findById(id)
        // Validar que el producto exista
        if (!existingProduct) {
            return res.status(404).send({ message: 'Product not found' })
        }
        // Verificar si la cantidad es mayor que 0 antes de restar
        if (existingProduct.stock > 0) {
            // Restar uno al stock
            let updatedValue = existingProduct.stock - 1
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
            // Responder si todo sale bien
            return res.send({ message: 'Product updated successfully', updatedProduct })
        } else {
            // Si la cantidad es 0, devolver un error
            return res.status(400).send({ message: 'there are no products in stock' })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating product' })
    }
}


export const addStock = async (req, res) => {
    try {
        // Capturar el id del animal a actualizar
        let { id } = req.params
        // Obtener el valor actual del atributo
        let existingProduct = await Product.findById(id)
        // Validar que el producto exista
        if (!existingProduct) {
            return res.status(404).send({ message: 'product not found' })
        }
        // suma uno al stock
        let updatedValue = existingProduct.stock + 1
        // Actualizar el stock
        let updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            { $set: { stock: updatedValue } }, // Utilizar $set para actualizar solo el atributo especificado
            { new: true }
        ).populate('category', ['nameCategory'])
        // Validar la actualización
        if (!updatedProduct) {
            return res.status(404).send({ message: 'Product not updated' })
        }
        // Responder si todo sale bien
        return res.send({ message: 'Product updated successfully', updatedProduct })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating product' })
    }
}


export const getMostSoldProducts = async (req, res) => {
    try {
        let mostSoldProducts = await Invoice.aggregate([
            {
                //$unwind se utiliza para desenrollar un campo de array en varios documentos, generando un documento para cada elemento de la matriz. 
                $unwind: '$items' // Deshacer el array items para obtener cada producto por separado
            },
            {
                //$group se utiliza para agrupar documentos basados en el campo items.product dentro del array items. 
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' }
                }
            },
            {
                //$sort se está ordenando en función del campo totalSold en orden descendente , lo que significa que los productos se ordenarán de mayor a menor cantidad vendida.
                $sort: {
                    totalSold: -1
                }
            }
        ]);
//Utiliza el método map para iterar sobre cada elemento del array mostSoldProducts. Para cada elemento (item), se accede al campo _id del objeto y se agrega ese valor al nuevo array.
        const productIds = mostSoldProducts.map(item => item._id);
//$in Esta especificando la condición de búsqueda. Busca documentos cuyo _id esté contenido en el array productIds. 
        const productsDetails = await Product.find({ _id: { $in: productIds } }, { productName: 1, price: 1 });

        const result = productsDetails.map(product => ({
            productName: product.productName,
            price: product.price
        }));

        res.json({ mostSoldProducts: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos más vendidos' });
    }
};

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const getMostAddedProducts = async (req, res) => {
    try {
        const mostAddedProducts = await Invoice.aggregate([
            {
                $unwind: '$items' // Deshacer el array items para obtener cada producto por separado
            },
            {
                $group: {
                    _id: '$items.product',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        const productIds = mostAddedProducts.map(item => item._id);

        const productsDetails = await Product.find({ _id: { $in: productIds } });

        const result = mostAddedProducts.map(item => ({
            product: productsDetails.find(product => product._id.toString() === item._id.toString()),
            count: item.count
        }));

        res.json({ mostAddedProducts: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos más agregados' });
    }
};