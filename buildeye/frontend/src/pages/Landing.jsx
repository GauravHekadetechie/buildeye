import React from "react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import ProblemStatement from "../components/ProblemStatement.jsx";
import Solution from "../components/Solution.jsx";
import HowAIWorks from "../components/HowAIWorks.jsx";
import Architecture from "../components/Architecture.jsx";
import DashboardPreview from "../components/DashboardPreview.jsx";
import AlertSystem from "../components/AlertSystem.jsx";
import ImpactFeasibility from "../components/ImpactFeasibility.jsx";
import Team from "../components/Team.jsx";
import TechStack from "../components/TechStack.jsx";
import Footer from "../components/Footer.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <Hero />
      <ProblemStatement />
      <Solution />
      <HowAIWorks />
      <Architecture />
      <DashboardPreview />
      <AlertSystem />
      <ImpactFeasibility />
      <Team />
      <TechStack />
      <Footer />
    </div>
  );
}
