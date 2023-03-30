import Web3Modal from 'web3modal';
import Web3 from 'web3';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from 'ethers';
import { config } from "./config";
import store from "../store";
import { setChainID, setWalletAddr, setBalance, setWeb3 } from '../store/actions';
import { parseErrorMsg } from '../components/utils';

const NFTAddress = config.nftAddress;
const NFTABI = config.nftAbi;
const StakingAddress = config.StakingAddress;
const StakingABI = config.StakingAbi;


let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: config.INFURA_ID, // required
          rpc: {
            25: config.mainNetUrl,
          },
        },
      },
    }, // required
    theme: "dark",
  });
}

export let provider = null;
export let web3Provider = null;

export const loadWeb3 = async () => {
  try {
    // await resetApp();
    // await web3Modal.clearCachedProvider();
    let web3 = new Web3(config.mainNetUrl);
    store.dispatch(setWeb3(web3));

    provider = await web3Modal.connect();
    console.log("provider", provider, web3Modal);
    web3 = new Web3(provider);
    store.dispatch(setWeb3(web3));

    web3Provider = new providers.Web3Provider(provider);
    const network = await web3Provider.getNetwork();
    store.dispatch(setChainID(network.chainId));

    // await checkNetwork();

    const signer = web3Provider.getSigner();
    const account = await signer.getAddress();
    store.dispatch(setWalletAddr(account));

    provider.on("accountsChanged", async function (accounts) {
      if (accounts[0] !== undefined) {
        store.dispatch(setWalletAddr(accounts[0]));
      } else {
        store.dispatch(setWalletAddr(''));
      }
    });

    provider.on('chainChanged', function (chainId) {
      store.dispatch(setChainID(chainId));
    });

    provider.on('disconnect', function (error) {
      store.dispatch(setWalletAddr(''));
    });
  } catch (error) {
    console.log('[Load Web3 error] = ', error);
  }
}

export const disconnect = async () => {
  await web3Modal.clearCachedProvider();
  const web3 = new Web3(config.mainNetUrl);
  store.dispatch(setWeb3(web3));
  store.dispatch(setChainID(''));
  store.dispatch(setWalletAddr(''));
  store.dispatch(setBalance({
    usdtBalance: '',
    astroBalance: ''
  }));
}

export const checkNetwork = async () => {
  if (web3Provider) {
    const network = await web3Provider.getNetwork();
    store.dispatch(setChainID(network.chainId));
    return checkNetworkById(network.chainId);
  }
}

export const checkNetworkById = async (chainId) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  if (web3.utils.toHex(chainId) !== web3.utils.toHex(config.chainId)) {
    await changeNetwork();
    return false;
  } else {
    return true;
  }
}

const changeNetwork = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: web3.utils.toHex(config.chainId) }],
    });
    console.log("Beast", web3, window)
  }
  catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    console.log("switchError Code", switchError.code)
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: web3.utils.toHex(config.chainId),
              chainName: 'CronosTestnet',
              rpcUrls: [config.mainNetUrl] /* ... */,
            },
          ],
        });
        return {
          success: true,
          message: "switching succeed"
        }
      } catch (addError) {
        return {
          success: false,
          message: "Switching failed." + addError.message
        }
      }
    }
  }
}

const resetApp = async () => {
  await web3Modal.clearCachedProvider();
  const { web3 } = store.getState().auth.web3;
  await web3.currentProvider.close();
  
  web3 = null;
  provider = null;
  web3Provider = null;
  store.dispatch(setWalletAddr(''));
  store.dispatch(setChainID(config.chainId));

  // this.setState({ ...INITIAL_STATE });
};

export const connectWallet = async () => {
  try {
    console.log("Beast connectWallet");
    await web3Modal.clearCachedProvider();
    provider = await web3Modal.connect();
    await provider.enable()
    const web3 = new Web3(provider);
    store.dispatch(setWeb3(web3));
    web3Provider = new providers.Web3Provider(provider);

    await checkNetwork();
    const signer = web3Provider.getSigner();
    const account = await signer.getAddress();

    if (account !== undefined) {
      store.dispatch(setWalletAddr(account));
    }

    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      address: "",
      status: "Something went wrong: " + err.message,
    };
  }
};

export const compareWalllet = (first, second) => {
  if (!first || !second) {
    return false;
  }
  if (first.toUpperCase() === second.toUpperCase()) {
    return true;
  }
  return false;
}

export const setApprove = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const NFTContract = new web3.eth.Contract(NFTABI, NFTAddress);
    const setApprove = NFTContract.methods.setApprovalForAll(StakingAddress, true);
    setApprove.estimateGas({ from: accounts[0] });
    await NFTContract.methods.setApprovalForAll(StakingAddress, true).send({from: accounts[0]});
    return {
      success: true
    }
  } catch (error) {
    console.log('[SetApproveForAll() Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const isApprovedForAll = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const NFTContract = new web3.eth.Contract(NFTABI, NFTAddress);
    let isAp = await NFTContract.methods.isApprovedForAll(accounts[0], StakingAddress).call();
    return {
      success: true,
      result: isAp
    }
  } catch (error) {
    console.log('[isApproved() Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const getUnstakedNFTsOfWallet = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let nftIds = await StakingContract.methods.getUnstakedItems(accounts[0]).call();
    return {
      success: true,
      nftIds
    }
  } catch (error) {
    console.log('[getUnstakedNFTsOfWallet Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const getStakedNFTsOfWallet = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let nftIds = await StakingContract.methods.getStakedItems(accounts[0]).call();
    return {
      success: true,
      nftIds
    }
  } catch (error) {
    console.log('[getStakedNFTsOfWallet Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const getPendingReward = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let reward = await StakingContract.methods.pendingTotalReward(accounts[0]).call();
    return {
      success: true,
      reward
    }
  } catch (error) {
    console.log('[getPendingReward Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const getNFTsOfWalletPerCollection = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const NFTContract = new web3.eth.Contract(NFTABI, NFTAddress);
    let nftIds = await NFTContract.methods.walletOfOwner(accounts[0]).call();
    return {
      success: true,
      nftIds
    }
  } catch (error) {
    console.log('[getNFTsOfWalletPerCollection Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const Stake = async(ids) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    await StakingContract.methods.stake(ids).send({ from: accounts[0] });
    return {
      success: true,
    }
  } catch (error) {
    console.log('[TOTAL Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const Unstake = async(ids) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    await StakingContract.methods.unstake(ids).send({ from: accounts[0] });
    return {
      success: true,
    }
  } catch (error) {
    console.log('[TOTAL Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}

export const Claim = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    await StakingContract.methods.claim().send({ from: accounts[0] });
    return {
      success: true,
    }
  } catch (error) {
    console.log('[Claim Error] = ', error);
    return {
      success: false,
      result: error.message
    }
  }
}