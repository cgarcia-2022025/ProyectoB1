// Configuracion de la conexion a la DB
'use strict'

import mongoose from "mongoose"
import User from '../src/user/user.model.js'
import Category from '../src/category/category.model.js'
import bcrypt from 'bcrypt';

export const connect = async()=>{
    try{
        mongoose.connection.on('error', ()=>{
            console.log('MongoDB |  could not be connect to mongodb')
            mongoose.disconnect()
        })
        mongoose.connection.on('connecting', ()=>{
            console.log('MongoDB | try connecting')
        })
        mongoose.connection.on('connected', ()=>{
            console.log('MongoDB | connected to mongodb')
        })
        mongoose.connection.on('open', async()=>{
            console.log('MongoDB | connected to database')
            const admin = await User.findOne()
            if (!admin) {
                const password = await bcrypt.hash('admin123', 15)
                const defaultT = new User({
                    name: 'carlos',
                    surname: 'garcia',
                    username: 'admin',
                    password: password,
                    email: 'admin@gmail.com',
                    role: 'ADMIN',
                    versionKey: false
                })
                await defaultT.save();
                console.log('New Admin:', defaultT)
            }

            const category = await Category.findOne()
            if (!category) {
                const defaultT = new Category({
                    nameCategory: 'Default',
                    description: 'Categoria Default',
                    versionKey: false
                })
                await defaultT.save();
                console.log('Nueva Cateogria:', defaultT)
            }
        })
        mongoose.connection.on('reconected', ()=>{
            console.log('MongoDB | reconected to mongodb')
        })
        mongoose.connection.on('disconected', ()=>{
            console.log('MongoDB | disconected to mongodb')
        })
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50
        })
    }catch(err){
        console.error('Database connection failed',err)
    }
}