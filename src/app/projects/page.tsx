"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /projects (índice) → /work — las series individuales siguen en /projects/:serie
export default function ProjectsIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/work");
  }, [router]);
  return null;
}
