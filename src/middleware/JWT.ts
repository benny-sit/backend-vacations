import { updateEnv } from "../utils/updateEnv";
import * as express from "express";

var jwt = require("jsonwebtoken");

const jwt_expires = 60 * 60 * 24;  // double that number - because there is a prev

type tokenPayload = {
  userId: number,
  username: string,
}


export const tokenize = (payload: tokenPayload) => {
  let token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: jwt_expires,
  });

  return token;
};

export const verifyToken = (token: string) => {

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_PREV);
        } catch (error) {
            return {isValid: false, error: error}
        }
    }

    return {isValid: true, decoded: decoded}
};

export const refreshSecretKey = () => {
  const refreshInterval = setInterval(() => {
      process.env.JWT_SECRET_PREV = process.env.JWT_SECRET;
      process.env.JWT_SECRET = require("crypto")
        .randomBytes(256)
        .toString("base64");
      if (process.env.NODE_ENV !== "production") {
        updateEnv({
          JWT_SECRET: process.env.JWT_SECRET,
          JWT_SECRET_PREV: process.env.JWT_SECRET_PREV,
        });
      }
      console.log(process.env.JWT_SECRET);
  }, jwt_expires * 1000);
};


export function handleAuthorization(request: express.Request, response: express.Response,  next: express.NextFunction): express.RequestHandler {
    if(!request.headers.authorization) {
        response.status(401).json({error: "you need authorization from /users/login"});
        return
    }
    const pureToken = request.headers.authorization.split(' ')[1]
    if (pureToken === undefined) {
        response.status(400).json({error: "Your token is broken"})
        return
    }
    const verified = verifyToken(pureToken);
    if(!verified.isValid) {
        response.status(401).json({error: "Token is not valid"});
        return
    }


    request.body.user = verified.decoded;

    let token = tokenize({username: verified.decoded.username, userId: verified.decoded.userId});
    response.set("Authorization", "Bearer " + token)
    next();
}
