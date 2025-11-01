"use client";
import { usePathname } from "next/navigation";
import StellarHeader from "./stellar-header";
import LandingHeader from "./landing-header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return isLanding ? <LandingHeader /> : <StellarHeader />;
}

