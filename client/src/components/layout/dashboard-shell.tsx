import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Swiss Army Knife</h1>
          <nav className="flex items-center gap-4">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              asChild
            >
              <Link href="/">Dashboard</Link>
            </Button>
            <Button
              variant={location === "/history" ? "default" : "ghost"}
              asChild
            >
              <Link href="/history">History</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}