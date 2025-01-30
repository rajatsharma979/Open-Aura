import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

import authController from "../controller/authenticationController.js";
import dataValidator from "../public/validatingLoginSignupData.js";
import isAuthenticated from "../public/authentication.js";
import passport from "../public/passport.js";
import { userType } from "../types/authTypes.js";

router.post('/login', dataValidator.validateLoginData, authController.postLogin);

router.post('/signup', dataValidator.validateSignupData, authController.postSignup);

router.get('/home' ,isAuthenticated, (req: Request, res: Response)=>{
    res.json("entered in protected route");
});

router.post('/auth/google', );

router.post('/refresh',authController.postRefreshTokens);

router.get('/auth/google', passport.authenticate('google', {scope: ['email', 'profile']}));

router.post('/logout', authController.logout);

router.get('/auth/google/callback',
    passport.authenticate('google', {session: false}),
    (req: Request, res: Response)=>{
    
        const userWithToken = req.user as { user: userType, accessToken: string, refreshToken: string};

        console.log(userWithToken);

        if (!userWithToken || !userWithToken.accessToken || !userWithToken.refreshToken) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }
        res.cookie('accessToken', userWithToken.accessToken, {
            httpOnly: true,
            //secure: true,             // set this true in production as it sends cookie over https only
            sameSite: 'strict',         // can be set to lax also. The cookie is sent with same-site requests and with "safe" cross-site requests like GET requests originating from links. 
            maxAge: Number(process.env.Access_Token_Cookie_Expiry)         //15 min in millis
        });

        res.cookie('refreshToken', userWithToken.refreshToken, {
            httpOnly: true,
            //secure: true,             // set this true in production as it sends cookie over https only
            sameSite: 'strict',         // can be set to lax also. The cookie is sent with same-site requests and with "safe" cross-site requests like GET requests originating from links. 
            maxAge: Number(process.env.Refresh_Token_Cookie_Expiry)         //15 min in millis
        });

        res.json({"msg": "successfully registered"});
        return;
    });

export default router;
