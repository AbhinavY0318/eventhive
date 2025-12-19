"use client";
import { SignedOut, SignInButton,SignUpButton,UserButton,SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import {BarLoader} from "react-spinners"
import { useStoreUser } from "@/hooks/use-store-user";
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
            <Authenticated>
              <UserButton />
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
