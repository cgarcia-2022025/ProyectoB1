'use strict'

import Product from './product.model.js'
import { checkUpdate } from '../utils/validator.js'

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
        let product = await Product.find()
        return res.send({product})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error '})
    }
}

//view a selected product

export const seeOneProduct = async(req, res)=>{
    try{
        //Obtener el parámetro de búsqueda
        let { search } = req.body
        //Buscar
        let products = await Product.find(
            {productName: search}
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

//see all products in a category

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
        let { id } = req.params    
        // Obtener el valor actual del atributo
        let existingProduct = await Product.findById(id)
        // Validar que el producto exista
        if (!existingProduct) {
            return res.status(404).send({ message: 'Product not found' })
        }
        // Verificar si la cantidad es mayor que 0 antes de restar
        if (existingProduct.stock > 0) {
            // Restar uno al atributo
            let updatedValue = existingProduct.stock - 1
            // Actualizar el animal
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
        // Restar uno al atributo
        let updatedValue = existingProduct.stock + 1
        // Actualizar el animal
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