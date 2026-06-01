"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isAuth = pathname === "/login" || pathname === "/signup";
  if (isAuth) return null;

  const links = [
    { href: "/ingest", label: "Ingest" },
    { href: "/chat", label: "Chat" },
    { href: "/details", label: "Details" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white text-xl font-bold">
          Codebase Intel
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                pathname === link.href
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}