import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <section className="max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-foreground">Thank you</h1>
        <p className="mt-4 text-muted-foreground">
          Your courtship form was submitted successfully. The assigned church
          leaders will continue the review process.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Return to the forms portal
        </Link>
      </section>
    </main>
  );
}
