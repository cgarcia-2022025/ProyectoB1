import express from "express";
import { pagar, getInvoicesOfUser } from './invoice.controller.js';
import { validateJwt, isAdmin } from '../middlewares/validate-jws.js'

const api = express.Router();


api.get('/pagar', [validateJwt],pagar)
api.post('/getInvoicesOfUser', [validateJwt, isAdmin],getInvoicesOfUser)
export default api