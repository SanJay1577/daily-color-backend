import express from 'express';
import{Color} from "../models/colors.js"
const router = express.Router(); 
import jwt from 'jsonwebtoken'

router.get("/", async (req,res)=>{
    try {
      const token = req.header("x-auth-token");
       jwt.verify(token,process.env.secretkey);


  const color = await Color.findOne({type:req.query.type});
  if(!color) return res.status(400).send({message:"Select a Skin Type"});

  res.status(200).send({data:color.name}); 
          

    } catch (error) {
        console.log(error); 
        res.status(500).send({message:"Internal Server Error"})
    }
})



export const colorUserrouter = router; 