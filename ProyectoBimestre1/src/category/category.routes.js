import express from "express";
import { registerCategory, test, deleteCategory, getCategory, updateCategory } from './category.controller.js';
import { validateJwt, isAdmin } from '../middlewares/validate-jws.js'

const api = express.Router();


// Funcionalidades para todos
api.get('/getCategory',getCategory)


// Funcionalidades para admins
api.get('/test', [validateJwt, isAdmin],test)
api.post('/registerCategory', [validateJwt, isAdmin],registerCategory)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)

export default api