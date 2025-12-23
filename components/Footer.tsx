"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="EventHive"
                width={140}
                height={40}
                className="object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed">
              EventHive helps you discover, create, and manage amazing events
              across India — all in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-white transition">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/create-event" className="hover:text-white transition">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-white transition"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="hover:text-white transition"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-white transition"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:support@eventhive.com"
                aria-label="Email"
                className="hover:text-white transition"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-center text-sm">
          <p>
            © {new Date().getFullYear()} EventHive. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
