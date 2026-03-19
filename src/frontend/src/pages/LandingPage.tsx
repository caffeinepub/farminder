import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    icon: <Leaf className="w-6 h-6 text-primary" />,
    title: "Crop Management",
    desc: "Easily register and organize all your crops \u2014 wheat, rice, corn, tomatoes, and more.",
  },
  {
    icon: <Calendar className="w-6 h-6 text-primary" />,
    title: "Monthly Schedule",
    desc: "Plan fertilizer applications for the entire month with an intuitive calendar interface.",
  },
  {
    icon: <Bell className="w-6 h-6 text-primary" />,
    title: "Daily Reminders",
    desc: "Get notified each day about which crops need fertilizer treatment. Never miss a spray.",
  },
];

const CALENDAR_EVENTS: Record<number, { label: string; color: string }> = {
  3: { label: "Fertilizer Spray", color: "bg-primary" },
  7: { label: "NPK Apply", color: "bg-chart-2" },
  12: { label: "Urea Spray", color: "bg-primary" },
  18: { label: "Fertilizer Spray", color: "bg-chart-4" },
  24: { label: "NPK Apply", color: "bg-primary" },
};

const TODAY_SCHEDULE = [
  { crop: "Corn", time: "7:00 AM", fertilizer: "Urea Spray" },
  { crop: "Tomato", time: "10:30 AM", fertilizer: "NPK Apply" },
  { crop: "Wheat", time: "4:00 PM", fertilizer: "Fertilizer Spray" },
];

const WEEKDAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];

// Build April 2024 calendar (April 1 = Monday, so startDay=1 padding)
function buildCalendar() {
  const daysInMonth = 30;
  const startPad = 1;
  const allCells: Array<{ key: string; day: number | null }> = [];
  for (let p = 0; p < startPad; p++)
    allCells.push({ key: `pad-start-${p}`, day: null });
  for (let d = 1; d <= daysInMonth; d++)
    allCells.push({ key: `day-${d}`, day: d });
  while (allCells.length % 7 !== 0)
    allCells.push({ key: `pad-end-${allCells.length}`, day: null });
  const rows: Array<{ key: string; cells: typeof allCells }> = [];
  for (let r = 0; r < allCells.length / 7; r++) {
    const slice = allCells.slice(r * 7, r * 7 + 7);
    const firstDay = slice.find((c) => c.day !== null);
    rows.push({
      key: firstDay ? `row-${firstDay.day}` : `row-pad-${r}`,
      cells: slice,
    });
  }
  return rows;
}

const CALENDAR_ROWS = buildCalendar();

export default function LandingPage() {
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleCTA = async () => {
    if (isAuthenticated) return;
    try {
      await login();
    } catch (e: any) {
      if (e?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[560px] flex items-center overflow-hidden">
        <img
          src="/assets/generated/hero-farm.dim_1400x700.jpg"
          alt="Farm crops"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.24 0.07 160 / 0.95) 0%, oklch(0.24 0.07 160 / 0.8) 40%, oklch(0.24 0.07 160 / 0.2) 70%, transparent 100%)",
          }}
        />
        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">
              Smart Reminders for{" "}
              <span className="text-green-300">Better Harvests</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
              Farminder helps you plan and track fertilizer schedules for all
              your crops. Never miss a spray day again.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    data-ocid="hero.dashboard.primary_button"
                    size="lg"
                    className="rounded-full px-8 font-semibold"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleCTA}
                  disabled={isLoggingIn}
                  data-ocid="hero.start.primary_button"
                  size="lg"
                  className="rounded-full px-8 font-semibold"
                >
                  {isLoggingIn ? "Logging in..." : "Start For Free"}
                </Button>
              )}
              <Button
                data-ocid="hero.learn_more.secondary_button"
                size="lg"
                variant="outline"
                className="rounded-full px-8 font-semibold border-white text-white bg-transparent hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href="#how-it-works">Learn More</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Farminder Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
              How Farminder Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three simple steps to keep your crops healthy all season long.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border shadow-card hover:shadow-hero transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-xl mb-2">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agricultural Calendar */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
              Your Agricultural Calendar
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              View and manage your entire month&apos;s fertilizer schedule at a
              glance.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Calendar Widget */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7 px-3"
                  >
                    Today
                  </Button>
                  <span className="font-semibold text-sm">April 2024</span>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((wd) => (
                  <div
                    key={wd.key}
                    className="text-center text-xs font-semibold text-muted-foreground py-1"
                  >
                    {wd.label}
                  </div>
                ))}
              </div>
              {CALENDAR_ROWS.map((row) => (
                <div key={row.key} className="grid grid-cols-7 gap-1 mb-1">
                  {row.cells.map((cell) => {
                    const event = cell.day ? CALENDAR_EVENTS[cell.day] : null;
                    return (
                      <div
                        key={cell.key}
                        className={`min-h-[52px] rounded-lg p-1 ${cell.day ? "bg-background hover:bg-accent/50 cursor-pointer transition-colors" : ""}`}
                      >
                        {cell.day && (
                          <>
                            <span className="text-xs font-medium text-foreground block text-center">
                              {cell.day}
                            </span>
                            {event && (
                              <div
                                className={`mt-0.5 rounded text-white text-[9px] px-1 py-0.5 truncate ${event.color}`}
                              >
                                {event.label}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg">
                  Today&apos;s Schedule
                </h3>
                <Button
                  data-ocid="landing.view_schedule.button"
                  size="sm"
                  className="rounded-full px-4 text-xs"
                  asChild
                >
                  <Link to="/schedule">View Schedule</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {TODAY_SCHEDULE.map((item) => (
                  <div
                    key={`${item.crop}-${item.time}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.crop}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.fertilizer}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Sign in to see your personalized schedule
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
