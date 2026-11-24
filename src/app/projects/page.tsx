"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /projects (índice) → /index — las series individuales siguen en /projects/:serie
export default function ProjectsIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/index");
  }, [router]);
  return null;
}
