import { NamingDedicationForm } from "@/components/forms/naming-dedication-form";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NamingDedicationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-daystar-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                  <div className="relative w-20 h-20 bg-transparent">
                    <Image
                      src="/images/daystar_logo.png"
                      alt="Daystar Christian Centre"
                      fill
                      className="object-contain bg-transparent"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Naming & Dedication Form
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Form Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Children are God's heritage! This form is intended to notify
                  the church of the birth of a new baby and to provide relevant
                  details for the upcoming naming ceremony. It helps us support
                  your family in prayer, plan any required pastoral involvement,
                  and make necessary arrangements for the naming event.
                </p>
              </div>
            </div>
            <NamingDedicationForm />
          </div>
        </div>
      </main>
    </div>
  );
}
