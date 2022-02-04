import React, { useState, useEffect } from "react";
import { useStatus } from "../context/statusContext";
import useSWR from "swr";

import {
  getNoFreeNft,
  getTotalSupply,
  getNftPrice,
  mintPublic,
  getSaleState,
  checkOnlyWhitelist,
  nftContract,
  getCurrentWalletConnected,
  mintWhiteList,
  getMaxSupply,
  getMaxMintPerTx,
  getBalnceOFwl,
} from "../utils/interact";

const Hero = () => {
  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { status, setStatus } = useStatus();

  const [count, setCount] = useState(1);
  const [maxMintAmount, setMaxMintAmount] = useState(10);
  const [totalSupply, setTotalSupply] = useState(0);
  const [nftPrice, setNftPrice] = useState("0.02");
  const [noFreeNft, setNoFreeNft] = useState(0);
  const [isSaleActive, setIsSaleActive] = useState(false);
  const [isWhiteList, setIsWhiteList] = useState(false);
  const [noForAddrWl, setNoForAddrWl] = useState(0);
  const [loadingPage, setLoadingPage] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [maxSupply, setMaxSupply] = useState(0);

  const [loading, setLoading] = useState(false);

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      });
    }
  };

  useEffect(() => {
    const checkIfClaimed = async () => {
      if (walletAddress != "" && isWhiteList) {
        await nftContract.methods
          .addressMintedBalance(walletAddress)
          .call()
          .then((result) => {
            setNoForAddrWl(result);
          })
          .catch((err) => {
            setNoForAddrWl(0);
          });

        let wlBalance = parseInt(await getBalnceOFwl(walletAddress));
        let noOfFreeNft = parseInt(await getNoFreeNft());
        setMaxMintAmount(noOfFreeNft - wlBalance);
      }
    };
    checkIfClaimed();
  }, [walletAddress, isWhiteList]);

  let whitelistProof = [];
  let whitelistValid = false;
  const whitelistRes = useSWR(
    isWhiteList && walletAddress
      ? `/api/whitelistProof?address=${walletAddress}`
      : null,
    {
      fetcher,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  if (!whitelistRes.error && whitelistRes.data) {
    const { proof, valid } = whitelistRes.data;
    whitelistProof = proof;
    whitelistValid = valid;
  }

  useEffect(() => {
    const fetchData = async () => {
      setMaxSupply(await getMaxSupply());
      setNftPrice(await getNftPrice());
      setIsSaleActive(await getSaleState());
      setIsWhiteList(await checkOnlyWhitelist());
      setMaxMintAmount(await getMaxMintPerTx());
      const walletResponse = await getCurrentWalletConnected();
      setWalletAddress(walletResponse.address);
      await updateTotalSupply();
      setLoadingPage(false);
    };
    fetchData();
    addWalletListener();
  }, []);

  const updateTotalSupply = async () => {
    const mintedCount = await getTotalSupply();
    setTotalSupply(mintedCount);
    const noOfFreeNft = await getNoFreeNft();
    setNoFreeNft(noOfFreeNft);
  };

  const incrementCount = () => {
    if (count < maxMintAmount) {
      setCount(count + 1);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const mintP = async () => {
    setLoading(true);
    const { status } = await mintPublic(count);
    setStatus(status);
    setLoading(false);
    updateTotalSupply();
  };

  const mintWl = async () => {
    setLoading(true);
    const { status } = await mintWhiteList(
      walletAddress,
      whitelistProof,
      count
    );
    setStatus(status);
    setLoading(false);
    updateTotalSupply();
  };

  const mintSection = () => {
    return (
      <>
        <div className="flex items-center mt-6 text-3xl font-bold text-gray-200">
          <button
            className="flex items-center justify-center w-12 h-12 bg-white rounded-md hover:bg-yellow-600 text-center"
            onClick={decrementCount}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 12H4"
              />
            </svg>
          </button>

          <h2 className="mx-8">{count}</h2>

          <button
            className="flex items-center justify-center w-12 h-12 bg-white rounded-md text-black hover:bg-yellow-600 text-center"
            onClick={incrementCount}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <h4 className="mt-2 font-semibold text-center text-white">
          {nftPrice} ETH <span className="text-sm text-gray-300"> + GAS</span>
        </h4>

        {loading ? (
          <img
            style={{ marginTop: "30px" }}
            src="/images/loading.gif"
            width={55}
          />
        ) : (
          <button
            className="mt-6 py-2 px-4 text-4xl text-center text-black uppercase bg-white border-b-4 border-white rounded hover:bg-yellow-600 hover:border-yellow-600"
            onClick={whitelistValid ? mintWl : mintP}
          >
            Mint
          </button>
        )}
      </>
    );
  };

  return (
    <main
      id="main"
      className="h-screen py-16 bg-pattern"
      style={{ height: "100%", marginBottom: "0px" }}
    >
      <div className="container max-w-6xl mx-auto flex flex-col items-center pt-4">
        <div className="flex flex-col items-center">
          <img
            src="/images/preview.gif"
            width="270"
            height="270"
            alt="emoji faces gif"
            className="rounded-md"
          />
          {loadingPage ? (
            <img
              style={{ marginTop: "100px" }}
              src="/images/loading.gif"
              width={65}
            />
          ) : (
            <>
              {isSaleActive ? (
                <>
                  {/* Minted NFT Ratio */}
                  <p className="bg-gray-100 rounded-md text-gray-800 font-extrabold text-lg my-4 py-1 px-3">
                    <span className="text-yellow-600">{`${totalSupply}`}</span>{" "}
                    /{maxSupply}
                  </p>

                  {(() => {
                    if (walletAddress !== "") {
                      if (isWhiteList && whitelistValid) {
                        if (parseInt(noForAddrWl) >= parseInt(noFreeNft)) {
                          return (
                            <>
                              <h4 className="font-semibold text-center text-white">{`YOU HAVE MINTED - ${noForAddrWl} / ${noFreeNft}`}</h4>
                              {/* {mintSection()} */}
                            </>
                          );
                        } else {
                          return (
                            <>
                              <h4 className="font-semibold text-center text-white">{`NFT AVAILABLE - ${noForAddrWl} / ${noFreeNft}`}</h4>
                              {mintSection()}
                            </>
                          );
                        }
                      } else if (isWhiteList && !whitelistValid) {
                        return (
                          <>
                            <h4 className="font-semibold text-center text-white">
                              Seems your address is not whitelisted, wait for
                              public sale
                            </h4>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <h4 className="font-semibold text-center text-white">
                              PUBLIC SALE
                            </h4>
                            {mintSection()}
                          </>
                        );
                      }
                    }
                  })()}

                  {/* {mintSection()} */}
                </>
              ) : (
                <p className="text-white text-2xl mt-8">
                  {" "}
                  Sale is not active yet
                </p>
              )}
            </>
          )}

          {/* Status */}

          {status && (
            <div className="flex items-center justify-center px-4 py-4 mt-8 font-semibold text-white bg-red-400 rounded-md ">
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Hero;
