// Validar diferentes datos
'use strict'

import { hash, compare  } from 'bcrypt'

export const checkUpdate = (data, userId)=>{
    if(userId){
        if(
            Object.entries(data).length === 0 ||
            data.nameCategory ||
            data.nameCategory == '' ||
            data.role ||
            data.role == ''
        ) {
            return false
        }
        return true
    }else{
        if(
            Object.entries(data).length === 0 ||
            data.categories ||
            data.categories == ''
        ) {
            return false
        }
        return true
    }
}

export const checkUpdateAdmin = (data, userId)=>{
    if(userId){
        if(
            Object.entries(data).length === 0 ||
            data.password ||
            data.password == '' 
            
        ){
            return false
        }
        return true
    }else{
        return false
    }
}

export const checkUpdateProduct = (data, Id)=>{
    if(Id){
        if(Object.entries(data).length === 0){
            return false
        }
        return true
    }else{
        return false
    }
}

export const checkPassword = async(password, hash)=>{
    try{
        return await compare(password, hash)
    }catch (err){
        console.error(err)
        return err
    }
}

export const encrypt = async(password)=>{
    try{
        return hash(password, 10)
    }catch(err){
        console.error(err)
        return err
    }
}
