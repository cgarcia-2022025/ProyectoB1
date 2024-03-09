import Category from './category.model.js'
import Product from '../Product/product.model.js'
import { checkUpdate } from '../utils/validator.js'

export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is runnign'})
}

export const registerCategory = async(req, res)=>{
    try{
        let data = req.body
        console.log(data)
        let category = new Category(data)
        await category.save()
        return res.send({message: `The category ${data.nameCategory} has been added`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message:'Error, cannot added the category'})
    }
}


export const updateCategory = async(req, res)=>{ //Datos generales (No password)
    try{
        //Obtener el id del usuario a actualizar
        let { id } = req.params
        //Obtener los datos a actualizar
        let data = req.body
        //Validar si data trae datos
        let update = checkUpdate(data)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be updated or missing data'})
        //Validar si tiene permisos (tokenización) X Hoy No lo vemos X
        //Actualizar (BD)
        let updatedCategory = await Category.findOneAndUpdate(
            {_id: id}, //ObjectsId <- hexadecimales (Hora sys, Version Mongo, Llave privada...)
            data, //Los datos que se van a actualizar
            {new: true} //Objeto de la BD ya actualizado
        )
        //Validar la actualización
        if(!updatedCategory) return res.status(401).send({message: 'Category not found and not updated'})
        //Respondo al usuario
        return res.send({message: 'Updated category', updatedCategory})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating account'})
    }
}

export const deleteCategory = async (req, res) => {
    try {
        let { id } = req.params;

        // Validar si existe la categoría
        let categoryToDelete = await Category.findById(id);
        if (!categoryToDelete) {
            return res.status(404).send({ message: 'Category not found and not deleted' });
        }

        // Encontrar la categoría predeterminada
        let defaultCategory = await Category.findOne({ nameCategory: 'Default' });

        if (!defaultCategory) {
            return res.status(500).send({ message: 'Default category not found or missing _id' });
        }

        // Transferir los productos asociados a la categoría predeterminada
        await Product.updateMany({ category: id }, { category: defaultCategory._id });

        // Eliminar la categoría
        await Category.findByIdAndDelete(id);

        return res.send({ message: 'The category was deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting category' });
    }
};

export const getCategory = async (req, res) => {
    try {
        let categories = await Category.find()
        return res.send({ categories })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting Categories' })
    }
}