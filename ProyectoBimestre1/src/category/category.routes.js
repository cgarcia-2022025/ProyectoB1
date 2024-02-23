import express from "express";
import { registerCategory, test, deleteCategory, getCategory, updateCategory } from './category.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/registerCategory',registerCategory)
api.put('/updateCategory/:id', updateCategory)
api.delete('/deleteCategory/:id', deleteCategory)
api.get('/getCategory',getCategory)

export default api