import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Leaf, LogIn } from "lucide-react";
import { motion } from "motion/react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import CalendarPage from "./pages/CalendarPage";
import CropsPage from "./pages/CropsPage";
import DashboardPage from "./pages/DashboardPage";
import MaterialsPage from "./pages/MaterialsPage";
import OtherWorkPage from "./pages/OtherWorkPage";
import PlotsPage from "./pages/PlotsPage";
import SchedulePage from "./pages/SchedulePage";
import SharePlotPage from "./pages/SharePlotPage";
import SpraySchedulePage from "./pages/SpraySchedulePage";

const queryClient = new QueryClient();

function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.20 0.06 160) 0%, oklch(0.28 0.09 155) 40%, oklch(0.22 0.07 165) 100%)",
      }}
    >
      <div
        className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-10"
        style={{ background: "oklch(0.75 0.18 140)" }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full opacity-10"
        style={{ background: "oklch(0.70 0.16 150)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
          style={{ background: "oklch(0.75 0.18 140)" }}
        >
          <Leaf className="w-10 h-10 text-white" />
        </div>

        <h1
          className="font-display font-bold text-5xl mb-2"
          style={{ color: "oklch(0.92 0.10 140)" }}
        >
          Farminder
        </h1>
        <p className="text-white/60 text-sm mb-2 tracking-widest uppercase font-medium">
          Farm Reminder App
        </p>

        <p className="text-white/80 text-base leading-relaxed mb-10 mt-4">
          Sign in to manage your crops and schedules.
          <br />
          Your fertilizer &amp; spray reminders await.
        </p>

        <div
          className="w-full rounded-2xl p-8 shadow-2xl"
          style={{
            background: "oklch(0.98 0.01 140 / 0.06)",
            border: "1px solid oklch(0.75 0.18 140 / 0.25)",
          }}
        >
          <h2 className="text-white font-semibold text-xl mb-2">
            Welcome, Farmer!
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Log in with your Internet Identity to access your personalized crop
            dashboard.
          </p>

          <button
            type="button"
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-6 font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            style={{
              background: isLoggingIn
                ? "oklch(0.55 0.14 140)"
                : "oklch(0.62 0.18 140)",
              boxShadow: "0 4px 20px oklch(0.62 0.18 140 / 0.4)",
            }}
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoggingIn ? "Signing in..." : "Sign In with Internet Identity"}
          </button>
        </div>

        <p className="text-white/30 text-xs mt-8">
          © {new Date().getFullYear()} Farminder · Rajveer Rohan Mane
        </p>
      </motion.div>
    </div>
  );
}

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <ProfileSetup open={showProfileSetup} />
      <Toaster richColors />
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Lock icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11v2H4v7h16v-7h-2v-2c0-1.657-1.343-3-3-3s-3 1.343-3 3v2H12v-2z"
            />
          </svg>
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">
          Sign in Required
        </h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to access this page.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});

const cropsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crops",
  component: () => (
    <AuthGuard>
      <CropsPage />
    </AuthGuard>
  ),
});

const plotsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plots",
  component: () => (
    <AuthGuard>
      <PlotsPage />
    </AuthGuard>
  ),
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/schedule",
  component: () => (
    <AuthGuard>
      <SchedulePage />
    </AuthGuard>
  ),
});

const sprayScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/spray-schedule",
  component: () => (
    <AuthGuard>
      <SpraySchedulePage />
    </AuthGuard>
  ),
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calendar",
  component: () => (
    <AuthGuard>
      <CalendarPage />
    </AuthGuard>
  ),
});

const materialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/materials",
  component: () => (
    <AuthGuard>
      <MaterialsPage />
    </AuthGuard>
  ),
});

const otherWorkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/other-work",
  component: () => (
    <AuthGuard>
      <OtherWorkPage />
    </AuthGuard>
  ),
});

const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/share",
  component: SharePlotPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  cropsRoute,
  plotsRoute,
  scheduleRoute,
  sprayScheduleRoute,
  calendarRoute,
  materialsRoute,
  otherWorkRoute,
  shareRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
