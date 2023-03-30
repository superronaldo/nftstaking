import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import Reveal from 'react-awesome-reveal';
import "react-circular-progressbar/dist/styles.css";
import ReactLoading from "react-loading";
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import * as selectors from '../store/selectors';
import { fadeIn, fadeInUp } from '../components/utils';
import {
  getUnstakedNFTsOfWallet,
  getStakedNFTsOfWallet,
  Stake,
  Unstake,
  setApprove,
  isApprovedForAll,
  Claim,
  getPendingReward
} from '../core/web3';
import Swal from 'sweetalert2';
import { Tab, Tabs } from '@mui/material';

const GlobalStyles = createGlobalStyle`
  .ico-container {
    display: flex;
    align-items: center;
    justify-content: start;
    flex-direction: column;
    background-size: 100% !important;
    background-position-x: center !important;
    .ico-header {
      max-width: 900px;
      padding: 20px;
      .ico-title {
        font-size: 36px;
        font-weight: 700;
        color: #F8C42F;
      }
      .ico-desc {
        font-size: 20px;
      }
    }
    @media only screen and (max-width: 1400px) {
      flex-direction: column;
    }
    @media only screen and (max-width: 768px) {
      padding: 10px;
      .ico-header {
        padding: 20px;
        .ico-title {
          font-size: 28px;
        }
        .ico-desc {
          font-size: 18px;
        }
      }
    }
  }

  .input-token-panel {
    display: flex;
    background-color: transparent;
    flex-direction: column;
    text-align: left;
    gap: 10px;
    width: 45%;
    .input-box {
      border: solid 1px white;
      border-radius: 8px;
      @media only screen and (max-width: 576px) {
        span {
          font-size: 15px !important;
        }
      }
    }
    @media only screen and (max-width: 768px) {
      width: 100%;
    }
  }

  .input-token {
    width: 50%;
    background: transparent;
    outline: none;
    padding: 10px;
    font-size: 20px;
    font-weight: bold;
    color: white;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    span {
      font-size: 18px;
      font-weight: normal;
    }
  }

  .email_input {
    max-width: 300px;
  }

  .presale-content {
    // max-width: 900px;
    padding: 0;
    background: rgba(19, 12, 29, 0.5);
    border-radius: 20px;
    // @media only screen and (max-width: 1024px) {
    //   max-width: 900px
    // }
    @media only screen and (max-width: 428px) {
      max-width: 100%;
    }
  }

  .presale-inner {
    border-radius: 12px;
    // padding: 10px 60px 40px;
    position: relative;
    background: transparent;
    min-height: 600px;
    max-height: 600px;
    max-width: 600px;
    min-width: 600px;
    h3 {
      line-height: 2;
      margin-bottom: 0;
    }
    @media only screen and (max-width: 1024px) {
      padding: 60px 40px 40px;
      min-height: 600px;
      max-height: 600px;
      max-width: 500px;
      min-width: 500px;
    }
    @media only screen and (max-width: 428px) {
      padding: 0px 10px 40px;
      min-height: 600px;
      max-height: 600px;
      max-width: 350px;
      min-width: 350px;
    }
  }

  .scrollprop {
    max-height: 500px !important;
    overflow-y: auto;
    scrollbar-width: none;
    @media screen and (max-width: 1200px) {
      overflow-y: auto;
      scrollbar-width: none;
    }
  }

  .presale-bg {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 76px;
  }

  .end-content {
    background: #2d81e2;
    padding: 16px;
    border-radius: 40px;
    width: 80%;
    margin: auto;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .buy_content {
    padding: 22px;
    border: solid 1.5px #5a5196;
    border-radius: 20px;
  }

  .progress-bg {
    @media only screen and (max-width: 576px) {
      width: 60%;
    }
  }

  .inverstors {
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
  }

  .amount_bar_text {
    display: flex;
    justify-content: space-between;
  }

  .progress {
    height: 1.5rem;
    background-color: #a9a9a9;
  }

  .progress-bar {
    background-color: #7621ff;
  }

  .MuiLoadingButton-root {
    transition: all 0.5s ease;
  }

  .MuiLoadingButton-loading {
    padding-right: 40px;
    background: linear-gradient(90deg, #aa2d78 -3.88%, #a657ae 100%);
    color: rgb(255 255 255 / 50%) !important;
    transition: all 0.5s ease;
  }
  .swal2-popup {
    border-radius: 20px;
    background: #2f2179;
    color: white;
  }
  .swal2-styled.swal2-confirm {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .backdrop-loading {
  }
  
  .btn-change {
    width: 40px;
    height: 40px;
    background-color: #8b86a4 !important;
    border-radius: 50%;
    margin-bottom: 8px !important;
    color: white !important;
    &:hover {
      background-color: #8b86a4 !important;
    }
  }

  .row {
    --bs-gutter-x: 0;
  }

  .noBorder {
    text-align: center;
    color: #000;
    border: solid 2px transparent;
    padding: 5px;
    border-radius: 15px;
  }
  .withBorder {
    text-align: center;
    color: #000;
    border: solid 2px #00ffff;
    padding: 5px;
    border-radius: 15px;
  }

  .presale-input {
    align-items: end;
    @media only screen and (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
  }
`;

const Loading = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 15px;
`;

const StyledPanel = styled('div')`
  display: flex;
  @media only screen and (max-width: 768px) {
    display: block;
  }
  @media only screen and (max-width: 1280px) {
    display: block;
  }
`;

const AstroICO = (props) => {
  const balance = useSelector(selectors.userBalance);
  const wallet = useSelector(selectors.userWallet);
  const web3 = useSelector(selectors.web3State);
  const isMobile = useMediaQuery({ maxWidth: '768px' });
  
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const [unstakedIds, setUnstakedIds] = useState([]);
  const [stakedIds, setStakedIds] = useState([]);
  const [selectedUnstakedIds, setSelectedUnstakedIds] = useState([]);
  const [selectedStakedIds, setSelectedStakedIds] = useState([]);
  const [unstakedImages, setUnstakedImages] = useState([]);
  const [stakedImages, setStakedImages] = useState([]);

  const [isApproved, setIsApproved] = useState(false);

  const [rewardAmount, setRewardAmount] = useState(0);

  const getInitAmount = useCallback(async () => {
    console.log('[Wallet] = ', wallet);
    setStakedIds([]);
    setUnstakedIds([]);
    if (!web3) {
      return;
    }
    setLoading(true);

    let res = await isApprovedForAll();
    if (res.success) {
      if (res.result) {
        setIsApproved(true);
      }
      else {
        setIsApproved(false);
      }
    }

    res = await getUnstakedNFTsOfWallet();
    if (res.success) {
      setUnstakedIds(res.nftIds);
    }

    res = await getImageURL(res.nftIds);
    setUnstakedImages(res);
    console.log(res)

    res = await getStakedNFTsOfWallet();
    if (res.success) {
      setStakedIds(res.nftIds);
    }
    
    res = await getImageURL(res.nftIds);
    setStakedImages(res);

    res = await getPendingReward();
    if (res.success) {
      setRewardAmount(Number((res.reward / 10 ** 18).toFixed(4)));
    }

    setSelectedStakedIds([]);
    selectedStakedIds.slice();
    setSelectedUnstakedIds([]);
    selectedUnstakedIds.slice();
    setLoading(false);
  }, [web3, wallet]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    getInitAmount();
  }, [getInitAmount, balance.usdtBalance]);

  const handleStake = async() => {
    setPending(true);
    if (isApproved) {
      try {
        if (selectedUnstakedIds.length === 0) {
          toast.error("There is no selected NFTs for swapping.")
          setPending(false);
          return;
        }
        let res = await Stake(selectedUnstakedIds);
        if (res.success) {
          getInitAmount();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Staked successfully.'
          })
        } else {
          toast.error("Transcation has been failed. " + res.result);
        }
      } catch (error) {
        toast.error("Transcation has been failed. " + error);
      }
    }
    else {
      try {
        let res = await setApprove();
        if (res.success) {
          getInitAmount();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Approved successfully.'
          });
        } else {
          toast.error("Transcation has been failed. " + res.result);
        }
      } catch (error) {
        toast.error("Transcation has been failed. " + error);
      }
    }
    setPending(false);
  }

  const handleUnstake = async() => {
    setPending(true);
    if (selectedStakedIds.length === 0) {
      toast.error("There is no selected NFTs for unstaking")
    } else {
      try {
        let res = await Unstake(selectedStakedIds);
        if (res.success) {
          getInitAmount();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Unstaked successfully.'
          })
        } else {
          toast.error("Transcation has been failed. " + res.result);
        }
      } catch (error) {
        toast.error("Transcation has been failed. " + error);
      }
    }
    setPending(false);
  }

  const handleClaim = async() => {
    setPending(true);
    if (rewardAmount === 0) {
      toast.error("There is no rewards for claiming")
    } else {
      try {
        let res = await Claim();
        if (res.success) {
          getInitAmount();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Claimed Reward Successfully.'
          })
        } else {
          toast.error("Transcation has been failed. " + res.result);
        }
      } catch (error) {
        toast.error("Transcation has been failed. " + error);
      }
    }
    setPending(false);
  }

  const getImageURL = async(arr) => {
    let imgArray = [];
    for (let i = 0; i < arr.length; i++) {
      var val;
      // await fetch("https://nftstorage.link/ipfs/bafybeifu3mc6d3db7dndtzafoyqkreqld44u7k4neyzuzitpyuyg7nnbya/" + arr[i] + ".json")
      await fetch("https://greatdaneai.mypinata.cloud/ipfs/QmaD8hgTwAWdhpPduPhX84LDEZS21eRkj4t8nSePPGXF9L/unreveal.json")
      .then(responese => responese.json())
      .then((jsonData) => {
        val = jsonData.image.replace("nftstorage.link", "ipfs.io");
      })
      // .then(responese => responese.json())
      // .then((jsonData) => {
      //   val = jsonData.image.replace("nftstorage.link", "ipfs.io");
      // })
      
      imgArray.push(val);
    }
    return imgArray;
  }

  const IsSelected = (type, tokenId) => {
    var a = 0;
    const list = type === 0
            ? selectedUnstakedIds
            : selectedStakedIds;
    for (a = 0; a < list.length; a++) {
      if (list[a] === tokenId) {
        return true;
      }
    }
    return false;
  };

  const removeItemFromArray = (oldlist, tokenId) => {
    var list = oldlist;
    var i = 0;
    for (i = 0; i < list.length; i++) {
      if (list[i] === tokenId) {
        list[i] = list[list.length - 1];
        list.pop();
        break;
      }
    }
    return list;
  };

  const unstakedImageClick = async(tokenId, index) => {
    // await fetch("https://ipfs.io/ipfs/" + collectionCIDs[tabIndex] + "/" + tokenId + ".json")
    // .then(responese => responese.json())
    // .then((jsonData) => {
    //   console.log(jsonData.attributes[0].value);
    // })
    if (await IsSelected(0, tokenId)) {
      let newList = removeItemFromArray(selectedUnstakedIds.slice(), tokenId);
      setSelectedUnstakedIds(newList);
    } else {
      var newList = selectedUnstakedIds.slice();
      newList.push(tokenId);
      setSelectedUnstakedIds(newList);
    }
    console.log("Beast", selectedUnstakedIds);
  }

  const stakedImageClick = async(tokenId, index) => {
    if (await IsSelected(1, tokenId)) {
      let newList = removeItemFromArray(selectedStakedIds.slice(), tokenId);
      setSelectedStakedIds(newList);
    } else {
      var newList = selectedStakedIds.slice();
      newList.push(tokenId);
      setSelectedStakedIds(newList);
    }
  }

  return (
    <div className='page-container text-center ico-container'>
      <GlobalStyles />
      <div className='ico-header'>
        {/*
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <p className='ico-title'>Welcome to $GREATAI Staking</p>
        </Reveal>
        <Reveal className='onStep' keyframes={fadeInUp} delay={300} duration={600} triggerOnce>
          <p className="ico-desc">
            You can get $SLG tokens by staking Selfie Guys NFTs.
          </p>
        </Reveal>
        */}
        {/* <Reveal className='onStep' keyframes={fadeInUp} delay={600} duration={600} triggerOnce>
          <Tabs value={tabValue} onChange={handleChangeTabs} textColor="#ffffff" centered className='ico-title'>
            <Tab value="0" label="VMS" />
            <Tab value="1" label="VMN" />
            <Tab value="2" label="VMG" />
            <Tab value="3" label="VMH" />
          </Tabs>
        </Reveal> */}
      </div>
      {loading ? (
        <div className='backdrop-loading'>
          <Loading className='loading'>
            <ReactLoading type={'spinningBubbles'} color="#fff" />
          </Loading>
        </div>
      ) : (
        <>
          <StyledPanel>
            <div style={{margin: "20px"}}>
              <Reveal className='onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
                <section className='presale-content'>
                  <div className='presale-inner pt-3 pb-4'>
                    <div className="scrollprop">
                      <div className="row justify-content-center">
                        {unstakedIds && unstakedIds.map((tokenId, idx) => {
                          const isSelected = IsSelected(0, tokenId);
                          let image = unstakedImages[idx];
                          return (
                            <div
                              className="col-5 col-md-5 col-lg-5 col-xl-3 item"
                              style={{
                                marginLeft: 1,
                                marginRight: 1,
                                marginTop: 30,
                              }}
                              onClick={() => unstakedImageClick(tokenId, idx)}
                              key={tokenId}
                            >
                              <img
                                className={isSelected? "withBorder" : "noBorder"}
                                src={image}
                                alt=""
                                style={{ width: "100%" }}
                              />
                              <div
                                style={{
                                  color: "white",
                                  fontSize: "20px",
                                  textAlign: "center",
                                }}
                              >
                                {tokenId}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>
              <Reveal className='main mt-3 onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
                <div className="row justify-center">
                  <div className='col-md-12 mt-3'>
                    <LoadingButton
                      onClick={handleStake}
                      endIcon={<></>}
                      loading={pending}
                      loadingPosition="end"
                      variant="contained"
                      className="btn-main btn3 m-auto fs-20"
                    >
                      {isApproved? "Stake" : "Approve"}
                    </LoadingButton>
                  </div>
                </div>
              </Reveal>
            </div>
            <div style={{margin: "20px"}}>
              <Reveal className='onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
                <section className='presale-content'>
                  <div className='presale-inner pt-3 pb-4'>
                    <div className="scrollprop">
                      <div className="row justify-content-center">
                        {stakedIds && stakedIds.map((tokenId, idx) => {
                          const isSelected = IsSelected(1, tokenId);
                          // let image = "https://ipfs.io/ipfs/" + tokenURIs[tabIndex] + "/" + tokenId + ".png";
                          let image = stakedImages[idx];
                          return (
                            <div
                              className="col-5 col-md-5 col-lg-5 col-xl-3 item"
                              style={{
                                marginLeft: 1,
                                marginRight: 1,
                                marginTop: 30,
                              }}
                              onClick={() => stakedImageClick(tokenId, idx)}
                              key={tokenId}
                            >
                              <img
                                className={isSelected? "withBorder" : "noBorder"}
                                src={image}
                                alt=""
                                style={{ width: "100%" }}
                              />
                              <div
                                style={{
                                  color: "white",
                                  fontSize: "20px",
                                  textAlign: "center",
                                }}
                              >
                                {tokenId}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>
              <Reveal className='main mt-3 onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
                <div className="row justify-center">
                  <div className='col-md-12 mt-3'>
                    <LoadingButton
                      onClick={handleUnstake}
                      endIcon={<></>}
                      loading={pending}
                      loadingPosition="end"
                      variant="contained"
                      className="btn-main btn3 m-auto fs-20"
                    >
                      Unstake
                    </LoadingButton>
                  </div>
                </div>
              </Reveal>
            </div>
          </StyledPanel>
          <div className='ico-header'>
          <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce style={{marginTop: "50px"}}>
              <p className='ico-desc'> Reward: {rewardAmount} $GREATAI</p>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
            <LoadingButton
              onClick={handleClaim}
              endIcon={<></>}
              loading={pending}
              loadingPosition="end"
              variant="contained"
              className="btn-main btn3 m-auto fs-20"
            >
              Claim
            </LoadingButton>
          </Reveal>
          </div>
        </>
      )}      
    </div >
  );
};

export default AstroICO;    