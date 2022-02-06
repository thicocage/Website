const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_API_URL);

const contract = require("./abi.json");
const contractAddress = "0x87AA289De0Ed103847871B38A49bB44131395881";
const nftContract = new web3.eth.Contract(contract, contractAddress);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const obj = {
        status: "",
        address: addressArray[0],
      };

      return obj;
    } catch (err) {
      return {
        address: "",
        status: "" + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href="https://metamask.io/download.html">
              You must install MetaMask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "",
        };
      } else {
        return {
          address: "",
          status: " connect your wallet",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "" + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href="https://metamask.io/download.html">
              You must install MetaMask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

// Contract Methods

const getMaxSupply = async () => {
  const result = nftContract.methods.maxSupply().call();
  return result;
};

const checkOnlyWhitelist = async () => {
  const result = nftContract.methods.onlyWhitelisted().call();
  return result;
};

export const getTotalSupply = async () => {
  const result = await nftContract.methods.totalSupply().call();
  return result;
};

const getNftPrice = async () => {
  const result = await nftContract.methods.cost().call();
  const resultEther = web3.utils.fromWei(result, "ether");
  return resultEther;
};

export const getSaleState = async () => {
  const result = await nftContract.methods.paused().call();
  return !result;
};

export const getNoFreeNft = async () => {
  const result = await nftContract.methods.nftPerAddressLimitWl().call();
  return result;
};

const getBalnceOFwl = async (_address) => {
  const result = await nftContract.methods
    .addressMintedBalance(_address)
    .call();
  return result;
};

export const getMaxMintPerTx = async () => {
  const result = await nftContract.methods.maxMintAmountPerTx().call();
  return result;
};

export const mintWhiteList = async (account, proof, mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: (
        <p>
          🦊 Connect to Metamask using{" "}
          <span className="px-2 text-yellow-600">Connect Wallet</span> button.
        </p>
      ),
    };
  }

  console.log("minting whitelist...");

  const resultEther = await getNftPrice();
  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: account, // must match user's active address.
    value: (web3.utils.toWei(resultEther, "ether") * mintAmount).toString(16), // hex
    gasLimit: "0",
    data: nftContract.methods.mintWhitelist(proof, mintAmount).encodeABI(), //make call to NFT smart contract
  };

  //sign the transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }
};

export const mintPublic = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: (
        <p>
          🦊 Connect to Metamask using{" "}
          <span className="px-2 text-yellow-600">Connect Wallet</span> button.
        </p>
      ),
    };
  }

  const resultEther = await getNftPrice();

  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: (web3.utils.toWei(resultEther, "ether") * mintAmount).toString(16), // hex
    gasLimit: "0",
    data: nftContract.methods.mint(mintAmount).encodeABI(), //make call to NFT smart contract
  };

  //sign the transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: " Something went wrong: " + error.message,
    };
  }
};

export {
  nftContract,
  getNftPrice,
  checkOnlyWhitelist,
  getMaxSupply,
  getBalnceOFwl,
};
