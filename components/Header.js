import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStatus } from "../context/statusContext";
import { connectWallet, getCurrentWalletConnected } from "../utils/interact";

const Header = () => {
  const { setStatus } = useStatus();
  const [walletAddress, setWalletAddress] = useState("");

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setWalletAddress(walletResponse.address);
    setStatus(walletResponse.status);
  };

  useEffect(() => {
    const fetchData = async () => {
      const walletResponse = await getCurrentWalletConnected();
      setWalletAddress(walletResponse.address);
      setStatus(walletResponse.status);
    };

    fetchData();
    addWalletListener();
  }, []);

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStatus("");
        } else {
          setWalletAddress("");
          setStatus("🦊 Connect to Metamask using Connect Wallet button.");
        }
      });
    }
  };

  return (
    <>
      <Head>
        <title>8000 C.Y.B.Rs</title>
        <meta name="description" content="8000 C.Y.B.Rs" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="preload"
          href="/fonts/HandbagRegular-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        ></link>
      </Head>

      <header className="sticky inset-x-0 top-0 z-10 h-20 min-w-full text-white border-b border-black bg-black backdrop-filter backdrop-blur-lg bg-opacity-30">
        <div className="flex items-center container mx-auto max-w-7xl justify-between h-full">
          {/* Logo */}
          <Link href="#">
            <a className="text-2xl font">
              <span className="pr-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white">
                C.Y.B.R
              </span>
              MINT
            </a>
          </Link>

          {/* Navigation */}

          <nav aria-label="Main Menu">
            <ul className="flex items-center space-x-8">
              <li className="hover:text-yellow-300 hover:border-yellow-300 cursor-pointer px-4 py-2 font-extrabold text-yellow-600 border border-yellow-600 rounded-md">
                <a
                  className=""
                  id="walletButton"
                  onClick={connectWalletPressed}
                >
                  {walletAddress.length > 0 ? (
                    "Connected: " +
                    String(walletAddress).substring(0, 6) +
                    "..." +
                    String(walletAddress).substring(38)
                  ) : (
                    <span>Connect Wallet</span>
                  )}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
