import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left content */}
          <div className="text-center sm:text-left">
            
            {/* Brand */}
            <div className="mb-6">
              <span className="font-semibold tracking-wide bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(99,102,241,0.45)]">
                EventHive
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tight">
              Discover &<br />
              create amazing
              <br />
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                events.
              </span>
            </h1>

           
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-lg font-light">
              Whether you're hosting or attending, EventHive helps you create, discover, and manage events effortlessly —
              from concept to celebration, all in one place.
            </p>

            {/* CTA */}
            <Link href="/explore">
              <Button size="default" className="rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Right - Hero Image */}
          {/* Right - Circular Hero Image */}
            <div className="relative block">
            <Image
              src="/hero.png"
              // src="/hero.gif"
              alt="react meetup"
              width={700}
              height={700}
              className="w-full h-auto"
              priority
            />
            {/* <video
              width="100%"
              height="100%"
              loop
              playsInline
              autoPlay
              muted
              className="w-full h-auto"
            >
              <source
                src="https://cdn.lu.ma/landing/phone-dark.mp4"
                type="video/mp4;codecs=hvc1"
              />
              <source
                src="https://cdn.lu.ma/landing/phone-dark.webm"
                type="video/webm"
              />
            </video> */}
          </div>

        </div>
      </section>
    </div>
  );
}
