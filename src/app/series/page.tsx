"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /series (índice) → /work — las series individuales siguen en /series/:serie
export default function SeriesIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/work");
  }, [router]);
  return null;
}
