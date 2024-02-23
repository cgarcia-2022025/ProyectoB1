import express from "express";
import { testProduct, registerProduct, deleteProduct, getProduct, update, seeOneProduct, seeProductsForCategory, restStock, addStock } from './product.controller.js';

const api = express.Router();

api.get('/testProduct', testProduct)
api.post('/registerProduct', registerProduct)
api.delete('/deleteProduct/:id', deleteProduct)
api.get('/getProduct', getProduct)
api.put('/updateProduct/:id', update)
api.post('/seeOneProduct', seeOneProduct)
api.post('/seeProductsForCategory', seeProductsForCategory)
api.put('/restStock/:id', restStock)
api.put('/addStock/:id', addStock)

export default api