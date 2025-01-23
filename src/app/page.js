import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-100">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl text-gray-900">Statify</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link 
            className="text-sm font-medium text-gray-600 hover:text-gray-900" 
            href="/sign-in"
          >
            Sign In
          </Link>
          <Link 
            className="text-sm font-medium text-gray-600 hover:text-gray-900" 
            href="/sign-up"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  Monitor Your Services in Real-Time
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Communicate with your users, and manage incidents effectively.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button 
                    variant="outline" 
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          © 2025 Statify. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link 
            className="text-xs text-gray-500 hover:text-gray-900" 
            href="#"
          >
            Terms of Service
          </Link>
          <Link 
            className="text-xs text-gray-500 hover:text-gray-900" 
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
