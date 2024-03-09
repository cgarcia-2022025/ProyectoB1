'use strict'

import User from './user.model.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import {  encrypt, checkPassword, checkUpdate, checkUpdateAdmin } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is runnign'})
}


export const register = async(req, res)=>{
    try{
    //Capturar el formulario (body)
    let data = req.body
    console.log(data)
    let {username} = req.body
        let userExists = await User.findOne({username})
        if(userExists){
            return res.status(500).send({message: 'Username ya en existencia'})
        }
    let {email} = req.body
        let emailExists = await User.findOne({email})
        if(emailExists){
            return res.status(500).send({message: 'Email ya en existencia'})
        }
    //Encriptar la contraseña
    data.password = await encrypt(data.password)
    // Agrega un rol por defecto
    data.role = 'CLIENT'
    //Guardar la informacion de la BD
    let user = new User(data)
    await user.save()
    //Responder al usuario
    return res.send({message: `Registrado exitosamente, bienvenido ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registrando usuario', err: err.errors})
    }
}


export const registerAdmin = async(req, res)=>{
    try{
    //Capturar el formulario (body)
    let data = req.body
    console.log(data)
    let {username} = req.body
        let userExists = await User.findOne({username})
        if(userExists){
            return res.status(500).send({message: 'Username ya en existencia'})
        }
    let {email} = req.body
        let emailExists = await User.findOne({email})
        if(emailExists){
            return res.status(500).send({message: 'Email ya en existencia'})
        }
    //Encriptar la contraseña
    data.password = await encrypt(data.password)
    // Agrega un rol por defecto
    data.role = 'ADMIN'
    //Guardar la informacion de la BD
    let user = new User(data)
    await user.save()
    //Responder al usuario
    return res.send({message: `Registrado exitosamente, bienvenido mastro ${user.name}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registrando usuario', err: err.errors})
    }
}


export const login = async(req, res)=>{
    try{
        //Capturar los datos (body)
        let { username , email, password } = req.body
        //Validar que el usuario exista
        let user = await User.findOne({username}) //Buscar un solo registro
        let correo = await User.findOne({email})
        //Verificar que la contraseña coincida
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name
            }
            //Generar token
                let token = await generateJwt(loggedUser)
            //Responder al usuario
            return res.send({message: `Welcome ${loggedUser.name}`, loggedUser,token})  
        }else if(correo && await checkPassword(password, correo.password)){
            let loggedUser = {
                uid: correo._id,
                username: correo.username,
                name: correo.name
            }
            //Generar token
                let token = await generateJwt(loggedUser)
            //Responder al usuario
            return res.send({message: `Welcome ${loggedUser.name}`, loggedUser,token})  
        }
        //Responde al usuario
        return res.status(404).send({message: 'User/Email o Password son incorrectos'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error para hacer login'})
    }
}

export const update = async (req, res) => {
    try {
        // ID del usuario a actualizar
        let { id } = req.params;
        // Obtener los datos a actualizar
                //Obtener la llave de acceso al token
        let secretKey = process.env.SECRET_KEY
        //obtener el token de los headers
        let { authorization } = req.headers
        //Obtener el uid del usuario que envió el token
        let { uid } = jwt.verify(authorization, secretKey)
                                    // if para verificar que el id es el mismo que el del token y que deje actualizar
        if(id == uid){
        // simon
        let data = req.body;
        // Validar si los datos traen información
        let update = checkUpdate(data, id);
        if (!update) return res.status(400).send({ message: 'Se han enviado datos que no se pueden actualizar o faltan datos' });
        // Verificar si se está actualizando la contraseña
        if (data.password) {
            // Verificar si se proporcionó la contraseña anterior
            if (!data.oldPassword) {
                return res.status(400).send({ message: 'Se requiere la contraseña anterior para cambiar la contraseña' });
            }
            // Obtener el usuario de la base de datos
            const user = await User.findById(id);
            // Comparar la contraseña anterior con la almacenada en la base de datos
            const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).send({ message: 'La contraseña anterior es incorrecta' });
            }
            // Encripta la contraseña
            data.password = await encrypt(data.password)
        }
        // Actualizar en la base de datos
        let updateUser = await User.findOneAndUpdate(
            { _id: id }, // ObjectID <- hexadecimal (Hora del sistema, versión de MongoDB, Clave privada)
            data, // Datos que se van a actualizar
            { new: true } // Objeto de la BD ya actualizado
        );
        // Validar la actualización
        if (!updateUser) return res.status(401).send({ message: 'Usuario no encontrado y no actualizado' });
        // Responder al usuario
        return res.send({ message: 'Actualización exitosa', updateUser });
    } else {
        return res.status(400).send({ message: 'No se pudo actualizar ya que no es tu usuario.' })
    }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error actualizando la cuenta' });
    }
};


export const updateForAdmin = async (req, res) => {
    try {
        // ID del usuario a actualizar
        let { id } = req.params;
        // simon
        let data = req.body;
        // Validar si los datos traen información
        let update = checkUpdateAdmin(data, id);
        if (!update) return res.status(400).send({ message: 'Se han enviado datos que no se pueden actualizar o faltan datos' });
        
        // Verificar si se está actualizando la contraseña
        if (data.password) {
            // Verificar si se proporcionó la contraseña anterior
            if (!data.oldPassword) {
                return res.status(400).send({ message: 'Se requiere la contraseña anterior para cambiar la contraseña' });
            }
            // Obtener el usuario de la base de datos
            const user = await User.findById(id);
            // Comparar la contraseña anterior con la almacenada en la base de datos
            const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).send({ message: 'La contraseña anterior es incorrecta' });
            }
            // Encripta la contraseña
            data.password = await encrypt(data.password)
        }
        // Actualizar en la base de datos
        let updateUser = await User.findOneAndUpdate(
            { _id: id }, // ObjectID <- hexadecimal (Hora del sistema, versión de MongoDB, Clave privada)
            data, // Datos que se van a actualizar
            { new: true } // Objeto de la BD ya actualizado
        );
        // Validar la actualización
        if (!updateUser) return res.status(401).send({ message: 'Usuario no encontrado y no actualizado' });
        // Responder al usuario
        return res.send({ message: 'Actualización exitosa', updateUser });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error actualizando la cuenta' });
    }
};


export const deleteU = async(req, res)=>{
    try{
        // Obtener el Id
        let { id } = req.params
          // Obtener los datos a actualizar
                  //Obtener la llave de acceso al token
          let secretKey = process.env.SECRET_KEY
          //obtener el token de los headers
          let { authorization } = req.headers
          //Obtener el uid del usuario que envió el token
          let { uid } = jwt.verify(authorization, secretKey)
                                      // if para verificar que el id es el mismo que el del token y que deje actualizar
          if(id == uid){
        let { CONFIRMAR } = req.body
        if(CONFIRMAR == 'confirmar'){
        // Validar si esta logueado y es el mismo X No lo vemos hoy X
        // Eliminar (deleteOne / findOneAndDelete)
        let deletedUser = await User.findOneAndDelete({_id: id})
        // Verificar que se elimino
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not deleted'})
        // Responder
        return res.send({message: `Account with username ${deletedUser.username} deleted succesfully`})
        }else{
            return res.status(400).send({ message: 'Error, escribe la palabra "confirmar" correctamente' })
        }
    }else{
        return res.status(400).send({ message: 'No es tu usuario' })
    }
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting acount'})
    }
}

export const deleteForAdmin = async(req, res)=>{
    try{
        // Obtener el Id
                // Obtener el Id
                let { id } = req.params
                        //Obtener la llave de acceso al token
                let secretKey = process.env.SECRET_KEY
                //obtener el token de los headers
                let { authorization } = req.headers
                //Obtener el uid del usuario que envió el token
                let { role } = jwt.verify(authorization, secretKey)
                              // Obtener el rol del usuario que se intenta eliminar
              let userToDelete = await User.findById(id);
              // Verificar que el admin no esté intentando eliminar a otro admin
              if (role === 'ADMIN' && userToDelete.role === 'ADMIN') {
                   return res.status(403).send({ message: 'No puedes eliminar a otros administradores' });
               }
        let { CONFIRMAR } = req.body
        if(CONFIRMAR == 'confirmar'){
        // Validar si esta logueado y es el mismo X No lo vemos hoy X
        // Eliminar (deleteOne / findOneAndDelete)
        let deletedUser = await User.findOneAndDelete({_id: id})
        // Verificar que se elimino
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not deleted'})
        // Responder
        return res.send({message: `Account with username ${deletedUser.username} deleted succesfully`})
        }else{
            return res.status(400).send({ message: 'Error, escribe la palabra "confirmar" correctamente' })
        }
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting acount'})
    }
}