import { Request, Response, NextFunction } from "express";
import jsonwebtoken, { JwtPayload} from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

interface accessTokenData extends JwtPayload{ //make tokenData like JwtPayload as we will assign later to first below. As JwtPayload have other fields as well other than our custom fields so we need to inherit those.
    id: string,
    name: string,
    email: string,
};


const isAuthenticated = (req: Request & {user?: accessTokenData}, res: Response, next: NextFunction)=>{ // (req: Request & {user: tokenData} because we would assign user object to req as req.user = user below;

    try{

        const token = req.cookies.accessToken;
    
        if(!token){
            res.status(401).json({'error': 'Access denied, No token provided'});
            return;
        }
    
        const tokenData = jsonwebtoken.verify(token, process.env.JWT_Access_Secret!) as accessTokenData; // typecast JwtPayload to tokenData to tell typescript that JwtPayload will contain our tokenData fields.
    
        if(!tokenData){
            res.status(401).json({'error': 'Access Denied, Login again'});
            return;
        }
    
        if(!tokenData || !tokenData.id || !tokenData.name || !tokenData.email){  //checking
            res.status(401).json({'error': 'Access Denied, invalid token structure'});
            return;
        }

        req.user = tokenData;
        next();
    }
    catch(err){
        console.log("Internal server error while verifying jwt token", err);
        
        res.status(500).json("");
        return;
    }
}

export default isAuthenticated;
