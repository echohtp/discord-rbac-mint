import Head from 'next/head'
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react'
import { NFTStorage } from 'nft.storage'
import { toast } from 'react-toastify'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Button } from 'antd'
import { Triangle } from 'react-loader-spinner'

const HOST = process.env.NEXT_PUBLIC_HOST

export default function KeyMintPage() {

  const router = useRouter()
  const { key } = router.query
  const [regKey, setRegKey] = useState("")
  const [user, setUser] = useState<null | any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [minting, setMinting] = useState<boolean>(false)

  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (router.isReady) {
      setRegKey(String(router.query.key))
      fetch(`https://${HOST}/api/key/${router.query.key}`)
        .then((data) => data.json())
        .then((data) => {
          console.log(`Data is`)
          console.log(data)
          setUser(data);
        })
        .then(() => setLoading(false))
        .catch((e: any) => { console.log(e); setUser(undefined) })
    }
  }, [router])

  const wallet = useWallet()



  async function mintAction(wallet: WalletContextState, user: any) {

    if (!wallet.connected || !wallet.publicKey || user.membershipNFTPublicKey || !user)
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
        axios.post(`https://${HOST}/api/key/${regKey}`, { nftMint: nftData.data.mintAddress!, id: user.id, nftId: retData.nftId })
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


  const style = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (<>
    <Head>
      <title></title>
      <meta name="description" content="" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    {/* <!-- this will use the whole viewport even in mobile --> */}
    <div className="absolute inset-0 bg-gray-900">
      <div className='text-center mt-4'>


        <div className="bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {!wallet.connected &&
              <button className='btn btn-outline btn-info' onClick={() => { setVisible(true) }}>Connect me</button>
            }
            {wallet.connected &&
              <button className='btn btn-outline btn-info' onClick={() => { wallet.disconnect() }}>{wallet.publicKey?.toBase58().slice(0, 4) + "...." + wallet.publicKey?.toBase58().slice(-4)} Disconnect</button>
            }
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">MemberMint</h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Where roles meet recognition.
            </p>

            {/* Loading Spinner */}
            {loading &&
              <>
                <span className="mt-4 loading loading-ring loading-lg text-white"></span>
              </>
            }

            {!loading && user.error &&
              <>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Invalid Key
                </p>
              </>
            }

            {/* BUTTONS GO HERE */}

            {!loading && !user.error && (user.solanaPublicKey == wallet.publicKey?.toBase58() && !user.membershipNFTPublicKey) &&
              <button className="btn btn-outline btn-info"
                onClick={() => {
                  mintAction(wallet, user)
                }}
              >
                {minting && <span className="loading loading-spinner"></span>}
                Mint Now</button>
            }

            {wallet.connected && !loading && !user.error && (user.solanaPublicKey != wallet.publicKey?.toBase58() && !user.membershipNFTPublicKey) &&
              <button className="btn btn-outline btn-info">Wrong Wallet</button>
            }


            {!loading && !user.error &&  (user.solanaPublicKey == wallet.publicKey?.toBase58() && user.membershipNFTPublicKey) &&
              <button className="btn btn-outline btn-info"
                onClick={() => {
                  
                }}
              >Minted</button>
            }

            {/* NO MORE BUTTONS */}


          </div>
        </div>
      </div>
    </div>
  </>)
}
