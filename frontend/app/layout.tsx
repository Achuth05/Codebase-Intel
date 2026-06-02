"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sessionTimeout = 3 * 60 * 60 * 1000;

    const logout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
    };

    const timer = window.setTimeout(logout, sessionTimeout);

    const handleUnload = () => {
      supabase.auth.signOut();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [router]);

  const hideNavbar = pathname === "/" || pathname === "/login" || pathname === "/signup";

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 min-h-screen`}>
        {!hideNavbar && <Navbar />}
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}