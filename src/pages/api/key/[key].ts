// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../lib/models/userModel';


type Data = {
  
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const {
    query: { key },
    method,
    body
  } = req;

  if (method == "GET") {
    console.log("Got a request")
    console.log(key)
    let user;
    try {
      user = await User.findAll({
        where: {
          registrationKey: key
        }
      })
      console.log(user)
      user = user[0]
    } catch (error) {
      console.log(error)

    }

    console.log("Sending back")
    //@ts-ignore
    console.log(user)
    //@ts-ignore
    res.status(200).json(user)
  }

  if (method == "POST"){    
    let user;
    try {
      user = await User.findAll({
        where: {
          registrationKey: key
        }
      })
      user = user[0]
    } catch (error) {
      console.log(error)

    }

    try{
      //@ts-ignore
      user.membershipNFTPublicKey = body.nftMint
      user.nftId = body.nftId
      //@ts-ignore
      await user.save()
      res.status(200).json({done: "done"})
    }catch(e){
      console.log(e)
    }



  }




}
