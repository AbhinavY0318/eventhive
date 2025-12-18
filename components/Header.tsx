import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 border-b bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        
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

      </div>
    </nav>
  );
};

export default Header;
