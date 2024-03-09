import express from "express";
import { validateJwt, isAdmin } from '../middlewares/validate-jws.js'
import { test, register, registerAdmin, login, update, updateForAdmin, deleteU, deleteForAdmin } from './user.controller.js';

const api = express.Router();

// Funcionalidades para todos
api.post('/register',register)
api.post('/login', login)
api.put('/update/:id', [validateJwt], update) 
api.delete('/deleteu/:id', [validateJwt], deleteU)

// Funcionalidades para admins
api.get('/test', [validateJwt, isAdmin], test)
api.post('/registerAdmin', [validateJwt, isAdmin], registerAdmin)
api.put('/updateForAdmin/:id', [validateJwt, isAdmin], updateForAdmin) 
api.delete('/deleteForAdmin/:id', [validateJwt, isAdmin], deleteForAdmin)

export default api