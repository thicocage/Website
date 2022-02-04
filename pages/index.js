import Head from "next/head";

import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Gallery from "../components/Gallery";
import FAQ from "../components/FAQ";

export default function Home() {
  const mystyle = {
    backgroundImage: "url(/images/dmo.gif)",
    backgroundSize: "540px 540px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom",
  };

  return (
    <div className="min-h-screen w-full bg-black" style={mystyle}>
      <Header />
      <Hero />
    </div>
  );
}
