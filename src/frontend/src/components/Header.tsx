import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { CalendarDays, Layers, Menu, Package, X } from "lucide-react";
import { useState } from "react";
import farmLogo from "/assets/uploads/Screenshot_2026-03-19-17-53-17-36_40deb401b9ffe8e1df2f1cc5ba480b12-1.jpg";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Crops", to: "/crops" },
  { label: "Plots", to: "/plots", icon: Layers },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Materials", to: "/materials", icon: Package },
];

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      qc.clear();
    } else {
      try {
        await login();
      } catch (e: any) {
        if (e?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={farmLogo}
            alt="Farminder Logo"
            className="w-10 h-10 object-contain rounded-full"
          />
          <span className="font-display font-bold text-xl text-foreground">
            Farminder
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`nav.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentPath === link.to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.icon && <link.icon className="w-3.5 h-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            data-ocid="nav.auth.button"
            className="rounded-full px-5 font-semibold"
            variant={isAuthenticated ? "outline" : "default"}
          >
            {isLoggingIn
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Sign Up Free"}
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium py-2 flex items-center gap-1.5 ${
                currentPath === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.icon && <link.icon className="w-3.5 h-3.5" />}
              {link.label}
            </Link>
          ))}
          <Button
            onClick={() => {
              handleAuth();
              setMenuOpen(false);
            }}
            disabled={isLoggingIn}
            className="rounded-full w-full"
            variant={isAuthenticated ? "outline" : "default"}
          >
            {isLoggingIn
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Sign Up Free"}
          </Button>
        </div>
      )}
    </header>
  );
}
