// src/pages/Landing.js

import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";

const Landing = () => {
  return (
    // Changed background to a light gray
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Landing;
