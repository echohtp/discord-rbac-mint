import Head from 'next/head'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react'
import { NFTStorage } from 'nft.storage'
import { toast } from 'react-toastify'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Button } from 'antd'

export default function KeyMintPage() {

  const router = useRouter()
  const { key } = router.query
  const [regKey, setRegKey] = useState("")
  const [user, setUser] = useState<null | any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [minting, setMinting] = useState<boolean>(false)


  useEffect(() => {
    if (router.isReady) {
      setRegKey(String(router.query.key))
      console.log(`http://localhost:3000/api/key/${router.query.key}`)
      fetch(`http://localhost:3000/api/key/${router.query.key}`)
        .then((data) => data.json())
        .then((data) => {
          console.log(`Data is`)
          console.log(data)
          setUser(data);
        })
        .then(() => setLoading(false))
        .catch((e:any) => {console.log(e)})
    }
  }, [router])

  const wallet = useWallet()



  async function mintAction(wallet: WalletContextState, user: any) {

    if (!wallet.connected || !wallet.publicKey || user.membershipNFTPublicKey)
      return

    setMinting(true)
    try {
      const config = {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_UNDERDOG_API_KEY!}` }
      }

      // Supply Image
      const cid = "bafybeigy65aewj3nxon4xpa7vfysvsqxmp6g5wm5s3dgx2o6pwhr6rgcgu"
      // console.log(cid)

      const nftdata = {
        name: `Membership Pass: ${user.username}`,
        description: "Description goes here",
        symbol: "AXT",
        image: `https://ipfs.io/ipfs/${cid}`,
        receiverAddress: wallet.publicKey.toBase58()
      }

      let createNftResponse

      createNftResponse = await axios.post(`${process.env.NEXT_PUBLIC_UNDERDOG_ENDPOINT}/v2/projects/${process.env.NEXT_PUBLIC_UNDERDOG_PROJECT_ID}/nfts`, nftdata, config)
      // successful
      if ([200, 202].includes(createNftResponse.status)) {


        const retData = createNftResponse.data

        console.log(retData)
        let nftData
        let loop = true
        while (loop) {
          nftData = await axios.get(`${process.env.NEXT_PUBLIC_UNDERDOG_ENDPOINT}/v2/projects/${process.env.NEXT_PUBLIC_UNDERDOG_PROJECT_ID}/nfts/${retData.nftId}`, config)
          if (nftData.data.status == "confirmed") loop = false
        }

        toast.success("Mint successful!", {
          position: toast.POSITION.BOTTOM_CENTER
        })

        if (!nftData) return
        console.log(nftData)
        let _user = user
        _user.membershipNFTPublicKey = nftData.data.mintAddress
        setUser(_user)
        axios.post(`http://localhost:3000/api/key/${regKey}`, { nftMint: nftData.data.mintAddress!, id: user.id, nftId: retData.nftId })
        setMinting(false)

      }

      //error
      if ([400, 401].includes(createNftResponse.status)) {
        toast.error("There was an error.", {
          position: toast.POSITION.BOTTOM_CENTER
        })
      }

    } catch {
      toast.error("There was an error.", {
        position: toast.POSITION.BOTTOM_CENTER
      })

    }
  }



  return (<>
    <Head>
      <title></title>
      <meta name="description" content="" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    {/* <!-- this will use the whole viewport even in mobile --> */}
    <div className="absolute inset-0">
      <div className='text-center mt-4'>
        <WalletMultiButton />
        {!user && <><p>Bad key</p></>}
        {wallet.connected && !loading && user.solanaPublicKey &&
          <>
            <div className='justify-center items-center text-center px-4 mx-auto pt-10'>

              <p>Key: {key}</p>
              <p>Expecing Wallet: {user.solanaPublicKey}</p>
              <p>Connected Wallet: {wallet.publicKey?.toBase58()}</p>
            </div >

            {(user.solanaPublicKey == wallet.publicKey?.toBase58() && !user.membershipNFTPublicKey) && <div className='justify-center items-center text-center px-4 mx-auto pt-10'>
              <Button
                loading={minting}
                onClick={() => { mintAction(wallet, user) }}
                className='btn border-2 px-4 py-2 rounded-xl hover:bg-gray-300 hover:text-black'
              >Mint it!</Button>
              <button className="text-white bg-blue-500 px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
                Big Button
              </button>
            </div >
            }

            {(user.solanaPublicKey == wallet.publicKey?.toBase58() && user.membershipNFTPublicKey) && <div className='justify-center items-center text-center px-4 mx-auto pt-10'>
              <Button
                onClick={() => { alert("minted") }}
                disabled
                className='btn border-2 px-4 py-2 rounded-xl hover:bg-gray-300 hover:text-black'
              >Minted</Button>
            </div >
            }
          </>
        }

        {!wallet.connected && <>not connected</>}
      </div>
    </div>
  </>)
}
