import { CourtshipForm } from "@/components/forms/courtship-form";
import { ArrowLeft, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CourtshipPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl border border-border bg-muted flex items-center justify-center shadow-sm">
                <Heart className="w-7 h-7 text-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance tracking-tight">
              Courtship Notification Form
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Begin your journey towards marriage with our Marriage Mentoring
              Programme. Register your courtship for proper guidance and
              counseling.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Important Notice
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <strong>15 counseling classes are compulsory</strong> and must
                  be attended before the Church can approve the wedding dates.
                  This program is designed to prepare couples for a successful
                  Christian marriage.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <div className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center">
                <Heart className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Marriage Mentoring Programme
                </h2>
                <p className="text-sm text-muted-foreground">
                  Complete the form below to begin your courtship registration
                </p>
              </div>
            </div>
            <CourtshipForm />
          </div>
        </div>
      </main>
    </div>
  );
}
