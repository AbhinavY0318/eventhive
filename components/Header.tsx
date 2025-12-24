"use client";

import {
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { Badge, Building, Crown, Plus, Ticket } from "lucide-react";
import OnboardingModal from "./onboarding-modal";
import { useOnboarding } from "@/hooks/use-onboarding";
import SearchLocationBar from "./search-location-bar";
import { useState } from "react";
import UpgradeModal from "./upgrade-modal";

const Header = () => {
  const { isLoading } = useStoreUser();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();
    const { has } = useAuth();
    const hasPro = has?.({ plan: "pro" });
      const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        {/* MAIN ROW */}
       <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center">
          
          {/* Logo */}
          <Link href="/" className="relative flex items-center shrink-0">
  <Image
    src="/logo.png"
    alt="EventHive Logo"
    width={150}
    height={40}
    priority
    className="object-contain"
  />

  {hasPro && (
    <span className="flex items-center gap-1 rounded-full bg-linear-to-r from-pink-500 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
      <Crown className="w-3 h-3" />
      PRO
    </span>
  )}
</Link>
          {/* DESKTOP SEARCH BAR */}
           <div className="hidden md:flex justify-center">
          <div className="w-full max-w-xl">
            <SearchLocationBar />
            </div>
         </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 ml-auto">
              {!hasPro && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
              >
                Pricing
              </Button>
            )}

            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">Explore</Link>
            </Button>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
              </SignInButton>
            </Unauthenticated>

            <Authenticated>
              <Button size="sm" asChild className="flex gap-2">
                <Link href="/create-event">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
              </Button>

              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  <UserButton.Link
                    label="My Events"
                    labelIcon={<Building size={16} />}
                    href="/my-events"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>
          </div>
        </div>

        {/* LOADER */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width="100%" color="blue" />
          </div>
        )}
      </nav>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />
        <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </>
  );
};

export default Header;
