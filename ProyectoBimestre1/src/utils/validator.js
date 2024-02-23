// Validar diferentes datos
'use strict'

export const checkUpdate = (data, userId)=>{
    if(userId){
        if(
            Object.entries(data).length === 0 ||
            data.nameCategory ||
            data.nameCategory == ''
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