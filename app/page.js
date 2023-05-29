"use client"

import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import StakeToken from '../artifacts/contracts/StakeToken.sol/StakeToken.json';
import { ToastContainer, toast } from 'react-toastify';
import { Bars } from 'react-loader-spinner';
import { TailSpin } from "react-loader-spinner";

const Home = () => {

  const [user, setUser] = useState({
    address: '',
    balance: '',
    stakedAmount: '',
    rewards: ''
  });

  const inputRef = useRef(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stake, setStake] = useState(false);
  const [unstake, setUnStake] = useState(false);

  useEffect(() => {
    const request = async () => {
      setLoading(true)
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();

        const rpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          StakeToken.abi,
          rpcProvider
        );
        let balance = Number(await contract.balanceOf(address));
        const stakerData = await contract.getStakerData(address);
        let stakedAmount = 0, rewards = 0;

        if (stakerData[0] === "0n") {
          stakedAmount = 0;
          rewards = 0;
        }
        else {
          stakedAmount = Number(stakerData[0]);
          rewards = Number(stakerData[2]);
        }

        setUser({ ...user, address, balance, stakedAmount, rewards });

        setLoading(false);
      }
      catch (error) {
        setLoading(false);
        return (
          <h1>Check Your Metamask</h1>
        )
      }
    }


    request();

  }, [])

  const Stake = async () => {
    setStake(true);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      StakeToken.abi,
      signer
    );
    const stakeAmount = inputRef.current.value;
    console.log(stakeAmount)

    if (user.balance > stakeAmount) {
      try {
        const response = await contract.stake(stakeAmount);
        await response.wait();
        console.log(response.to)
        inputRef.current.value = "";
        toast.success("Tokens Staked")
      }
      catch (error) {
        console.log(error)
        if (stakeAmount === '') {
          toast.warning("Please Enter Value")
        }
        else {
          toast.error("Transaction Failed")
        }
        inputRef.current.value = "";
      }
    }
    else {
      console.log("not enough balance")
      inputRef.current.value = "";
      toast.error("Not Enough Balance ")
    }

    setStake(false);
    setTimeout(()=>{
      window.location.reload();
    }, 3000)
  }

  const unStake = async () => {
    setUnStake(true);
    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        StakeToken.abi,
        signer
      );

      const response = await contract.unstake();
      await response.wait();
      console.log(response.to)
      toast.success("Token Unstaked !");
      setTimeout(()=>{
        window.location.reload();
      }, 3000)

    }
    catch (error) {
      console.log(error);
      toast.error("Transaction Failed !")
    }
    setUnStake(false);
  }


  return (
    <>

      <ToastContainer />
      {
        loading ?
          <div className='w-full h-[100vh] flex justify-center items-center'>
            <Bars
              height="40"
              width="40"
              color="#4fa94d"
              ariaLabel="bars-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div> :
          <div className="md:w-11/12 lg:w-9/12 mx-auto">
            <div className='w-full bg-gray-900'>
              <div className="flex justify-between items-center py-5">
                <h1>
                  Staking Token
                </h1>
                <h1 className="bg-gray-800 px-4 py-1 rounded-lg">
                  {user.address.slice(0, 5)}...{user.address.slice(39)}
                </h1>
              </div>
            </div>
            <div className='my-10'>
              <div className="p-10 w-3/5 bg-gray-800 rounded-lg mx-auto space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className='font-semibold'>Stake Tokens</h1>
                  <h1>
                    Balance : {user.balance}
                  </h1>
                </div>
                <div className='flex flex-col space-y-8 justify-center border-2 border-gray-600 p-10'>
                  <input ref={inputRef} type="number" name="token" id="" placeholder='Enter Token' className='w-full focus:outline-none px-4 text-black py-2 rounded-sm' />
                  <div className='flex '>
                    {
                      stake ?
                      <button className='bg-teal-700 hover:opacity-80 transition-all py-2 px-5 w-fit mx-auto shadow-xl rounded-sm'>
                        <TailSpin color="#fff" height={20} />
                      </button>
            
                      :
                        <button onClick={Stake} className='bg-teal-700 hover:opacity-80 transition-all py-2 px-5 w-fit mx-auto shadow-xl rounded-sm'>
                          STAKE
                        </button>
                    
                    }
                    
                    {
                      user.stakedAmount !== 0 ?
                      unstake ?
                        <button className='bg-red-700 hover:opacity-80 transition-all py-2 px-5 w-fit mx-auto shadow-lg rounded-md'>
                          <TailSpin color="#fff" height={20} />
                        </button>
                        :
                        <button className='bg-red-700 hover:opacity-80 transition-all py-2 px-5 w-fit mx-auto shadow-lg rounded-md' onClick={unStake}>UNSTAKE</button>
                      :
                      null
                    }
                  </div>
                </div>
              </div>
              <div className="p-10 w-3/5 mx-auto space-y-5">
                <div className='flex flex-row justify-between px-5'>
                  <div className="text-center space-y-3">
                    <h4 className="">
                      Staked Tokens
                    </h4>
                    <h4 className="">{user.stakedAmount} CTB</h4>
                  </div>
                  <div className="text-center space-y-3">
                    <h4 className="">
                      Reward Balance
                    </h4>
                    <h4 className="">{user.rewards} CTB</h4>
                  </div>
                </div>
              </div>
            </div>
            <div>
            </div>
          </div>
      }

    </>
  )
}

export default Home;