import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

import authController from "../controller/authenticationController.js";
import dataValidator from "../public/validatingLoginSignupData.js";
import isAuthenticated from "../public/authentication.js";

router.post('/login', dataValidator.validateLoginData, authController.postLogin);

router.post('/signup', dataValidator.validateSignupData, authController.postSignup);

router.get('/home', isAuthenticated, (req: Request, res: Response)=>{
    res.json("entered in protected route");
})

router.post('/refresh', authController.postRefreshTokens);

router.post('/logout', authController.logout);


export default router;
