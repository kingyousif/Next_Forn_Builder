import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-xl">FormCraft</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Create Forms with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Build, publish, and analyze forms in minutes. No coding
                  required.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FormCraft. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
