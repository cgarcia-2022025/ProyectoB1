import express from "express";
import { testProduct, registerProduct, deleteProduct, getProduct, productsOutOfStock, update, seeOneProduct, seeProductsForCategory, restStock, addStock, getMostAddedProducts, getMostSoldProducts } from './product.controller.js';
import { validateJwt, isAdmin } from '../middlewares/validate-jws.js'

const api = express.Router();


// Funcionalidades para todos
api.get('/getProduct', [validateJwt],  getProduct)
api.post('/seeOneProduct', [validateJwt],  seeOneProduct)
api.post('/seeProductsForCategory', [validateJwt],  seeProductsForCategory)
api.get('/getMostSoldProducts', [validateJwt],  getMostSoldProducts)


// Funcionalidades para admins
api.get('/testProduct', [validateJwt, isAdmin], testProduct)
api.post('/registerProduct', [validateJwt, isAdmin],  registerProduct)
api.delete('/deleteProduct/:id', [validateJwt, isAdmin],  deleteProduct)
api.get('/productsOutOfStock', [validateJwt, isAdmin],  productsOutOfStock)
api.put('/updateProduct/:id', [validateJwt, isAdmin],  update)
api.put('/restStock/:id', [validateJwt, isAdmin],  restStock)
api.put('/addStock/:id', [validateJwt, isAdmin],  addStock)
api.get('/getMostAddedProducts', [validateJwt, isAdmin],  getMostAddedProducts)


export default api