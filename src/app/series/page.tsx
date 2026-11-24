"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /series (índice) → /index — las series individuales siguen en /series/:serie
export default function SeriesIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/index");
  }, [router]);
  return null;
}
