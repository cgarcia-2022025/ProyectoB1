import express from "express";
import { addToCart, removeFromCart, getProductsCart, generateInvoice, getPurchasedProducts } from './cart.controller.js';
import { validateJwt } from '../middlewares/validate-jws.js'

const api = express.Router();


// Funcionalidades para todos
api.post('/addToCart', [validateJwt],addToCart)
api.post('/removeFromCart', [validateJwt],removeFromCart)
api.get('/getProductsCart', [validateJwt],getProductsCart)
api.get('/generateInvoice', [validateJwt],generateInvoice)
api.get('/getPurchasedProducts', [validateJwt],getPurchasedProducts)

export default api