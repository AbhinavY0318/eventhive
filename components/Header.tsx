"use client";
import { SignedOut, SignInButton,SignUpButton,UserButton,SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import {BarLoader} from "react-spinners"
import { useStoreUser } from "@/hooks/use-store-user";
import { Building, Plus, Ticket } from "lucide-react";
const Header = () => {
  const {isLoading}=useStoreUser();
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 border-b bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo only */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="EventHive Logo"
            width={150}
            height={44}
            priority
            className="object-contain"
          />
        </Link>
        <div className="flex items-center">
           <Unauthenticated>
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
                </SignInButton>
             
            </Unauthenticated>
            <Button variant={"ghost"} size="sm">Pricing</Button>
            <Button variant={"ghost"} size="sm" asChild className="mr-2"><Link href="explore">Explore</Link></Button>
            <Authenticated>
                   <Button size="sm" asChild className="flex gap-2 mr-4">
                <Link href="/create-event">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
              </Button>
              <UserButton >
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
      {/* Bar Loader*/}
      {isLoading && (
        <div className="absolute bottom-0 left-0 w-full">
        <BarLoader width={"100%"} color="blue"/>
      </div>
      )}
      
    </nav>
  );
};

export default Header;
