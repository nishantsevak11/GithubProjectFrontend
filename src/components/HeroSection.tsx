// src/components/HeroSection.js

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Blurred gradient shape */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2"
      >
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Unlock Your
          <span className="mt-2 block">GitHub Insights</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Get comprehensive analytics for any public repository, or connect your
          account to view detailed insights across all your projects.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/public-stats">
            <Button
              size="lg"
              className="group w-full bg-gray-900 text-white hover:bg-gray-800 sm:w-auto"
            >
              Analyze Public Repo
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Button>
          </Link>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/github`}
          >
            <Button size="lg" variant="link" className="text-gray-600">
              Login with GitHub <span aria-hidden="true">→</span>
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
