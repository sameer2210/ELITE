import React from "react";
import HeroSlider from "../../components/home/HeroSlider";
import LandingSections from "../../components/home/LandingSections";

const Home = () => {
  return (
    <div className="bg-[#0c0d10] text-white">
      <HeroSlider />
      <LandingSections />
    </div>
  );
};

export default Home;
