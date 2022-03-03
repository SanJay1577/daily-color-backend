import express from "express";
import bcrypt from "bcrypt";
import joi from "joi";
import { User } from "../models/user.js";
import { Token } from "../models/token.js";
import { sendEmail } from "../chekmail/sendEmail.js";
import crypto from 'crypto';
//login validation
const validate = (data) => {
  const schema = joi.object({
    email: joi.string().email().required().label("Email"),
    password: joi.string().required().label("password"),
  });
  return schema.validate(data);
};

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    //error handling
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error });

    //validating the user deatils
    const user = await User.findOne({ email: req.body.email });

    //if the userdoesn't exist
    if (!user) return res.status(401).send({ message: "Invalid Credentials" });

    //Password validation
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send({ message: "Invaid Credentials" });

      //user Token validation 
      if(!user.verified){
        let token = await new Token.findOne({ userId:user._id});
        if(!token){
          token = await new Token({
            userId:user._id,
            token :crypto.randomBytes(32).toString("hex"),}).save();
      const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
      await sendEmail(user.email,"Verify Email", url); 
        }
        return res.status(400).send({message:"An email sent to your account please verify"});
      }

    //generating the token from userSchema in user.js
    const token = user.generateAuthToken();
    res.status(200).send({ data: token, message: "Logged in sucessfully" });
  } catch (error) {
    //In casae of internal server error
    console.log(error);
    res.status(500).send({ message: "Internal Server error" });
  }
});

export const loginRouter = router;
