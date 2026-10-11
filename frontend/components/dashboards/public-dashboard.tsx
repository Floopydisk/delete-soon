"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FileText, Heart } from "lucide-react";

const pageImages: Record<string, { src: string; alt: string }> = {
  "/": {
    src: "/images/hero.jpg",
    alt: "DaystarNG Forms",
  },
  "/forms/naming-dedication": {
    src: "/images/naming.jpg",
    alt: "DaystarNG Naming and Dedication Form",
  },
  "/forms/courtship": {
    src: "/images/courtship-hero.jpg",
    alt: "DaystarNG Coutrtship Form",
  },
  "/forms/burial-request": {
    src: "/images/hero.jpg",
    alt: "DaystarNG Burial Form",
  },
};

export function PublicDashboard() {
  const pathname = usePathname();
  const normalizedPathname =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  const imageSrc =
    pageImages[normalizedPathname] ??
    Object.entries(pageImages).find(
      ([route]) => route !== "/" && normalizedPathname.startsWith(route),
    )?.[1] ??
    pageImages["/"];

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <section className="relative mb-10 min-h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={imageSrc.src}
            alt={imageSrc.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 896px) 100vw, 896px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
          <div className="relative z-10 flex min-h-72 max-w-xl flex-col justify-center p-8 text-white md:p-10">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Welcome to Daystar Forms Portal
            </h1>
            <p className="mt-4 text-base text-white/90 md:text-lg">
              Begin your journey with the guidance, care, and support of your
              church family.
            </p>
          </div>
        </section>

        <p className="text-lg text-muted-foreground mb-8">
          Please select a form to get started.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/forms/naming-dedication">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Naming & Dedication Form</CardTitle>
                <CardDescription>
                  Submit a form for child naming and dedication.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  For parents to register their child for naming and dedication
                  ceremony.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/forms/courtship">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <Heart className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Courtship Form</CardTitle>
                <CardDescription>
                  Submit a form for courtship counseling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  For individuals or couples seeking guidance and approval for
                  courtship.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link href="/forms/burial-request">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Burial Request Form</CardTitle>
                <CardDescription>
                  Submit a form for burial arrangements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  For families to request church involvement in burial
                  ceremonies.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
