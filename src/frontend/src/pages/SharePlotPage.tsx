import { Badge } from "@/components/ui/badge";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Calendar, FlaskConical, Leaf, Wind } from "lucide-react";
import farmLogo from "/assets/uploads/Screenshot_2026-03-19-17-53-17-36_40deb401b9ffe8e1df2f1cc5ba480b12-1.jpg";
import type {
  FertilizerSchedule,
  SpraySchedule,
  backendInterface,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatDate(d: { day: bigint; month: bigint; year: bigint }) {
  const day = Number(d.day).toString().padStart(2, "0");
  const month = Number(d.month).toString().padStart(2, "0");
  const year = Number(d.year);
  return `${day}/${month}/${year}`;
}

function dateToMs(d: { day: bigint; month: bigint; year: bigint }) {
  return new Date(Number(d.year), Number(d.month) - 1, Number(d.day)).getTime();
}

export default function SharePlotPage() {
  const params = new URLSearchParams(window.location.search);
  const userParam = params.get("user") || "";
  const plotParam = params.get("plot") || "";

  const { actor, isFetching } = useActor();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["plotShare", userParam, plotParam],
    queryFn: async () => {
      if (!actor || !userParam || !plotParam) return null;
      const principal = Principal.fromText(userParam);
      return (actor as unknown as backendInterface).getPlotSchedulesPublic(
        principal,
        plotParam,
      );
    },
    enabled: !!actor && !isFetching && !!userParam && !!plotParam,
  });

  type Entry =
    | (FertilizerSchedule & { _type: "fertilizer" })
    | (SpraySchedule & { _type: "spray" });

  const entries: Entry[] = data
    ? [
        ...data.fertilizerSchedules.map((f) => ({
          ...f,
          _type: "fertilizer" as const,
        })),
        ...data.spraySchedules.map((s) => ({ ...s, _type: "spray" as const })),
      ].sort((a, b) => dateToMs(a.scheduledDate) - dateToMs(b.scheduledDate))
    : [];

  const isInvalid = !userParam || !plotParam;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.97 0.02 140) 0%, oklch(0.95 0.03 150) 100%)",
      }}
    >
      {/* Header */}
      <header className="py-4 px-5 flex items-center gap-3 border-b border-border bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <img
          src={farmLogo}
          alt="Farminder Logo"
          className="w-10 h-10 rounded-xl object-cover shadow-sm"
        />
        <div>
          <h1
            className="font-bold text-lg leading-tight"
            style={{ color: "oklch(0.35 0.12 140)" }}
          >
            Farminder
          </h1>
          <p className="text-xs text-muted-foreground">Farm Schedule Share</p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {isInvalid ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Invalid Share Link</h2>
            <p className="text-muted-foreground">
              This link is missing required parameters.
            </p>
          </div>
        ) : isLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">
              Loading plot schedule...
            </p>
          </div>
        ) : isError || !data ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Plot Not Found</h2>
            <p className="text-muted-foreground">
              This plot schedule could not be loaded. The link may be invalid or
              the data has been removed.
            </p>
          </div>
        ) : (
          <>
            {/* Plot Title */}
            <div className="mb-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3"
                style={{
                  background: "oklch(0.92 0.08 140)",
                  color: "oklch(0.32 0.12 140)",
                }}
              >
                <Leaf className="w-3.5 h-3.5" />
                Shared Plot Schedule
              </div>
              <h2
                className="font-bold text-2xl mb-1"
                style={{ color: "oklch(0.28 0.10 140)" }}
              >
                {plotParam}
              </h2>
              <p className="text-sm text-muted-foreground">
                {entries.length} schedule{entries.length !== 1 ? "s" : ""} total
              </p>
            </div>

            {/* Entries */}
            {entries.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center border-2 border-dashed"
                style={{ borderColor: "oklch(0.85 0.06 140)" }}
                data-ocid="share.empty_state"
              >
                <Calendar
                  className="w-10 h-10 mx-auto mb-3"
                  style={{ color: "oklch(0.65 0.10 140)" }}
                />
                <p className="text-muted-foreground">
                  No schedules found for this plot.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {entries.map((entry, i) => {
                  const isFert = entry._type === "fertilizer";
                  const name = isFert
                    ? (entry as FertilizerSchedule).fertilizerName
                    : (entry as SpraySchedule).sprayName;
                  return (
                    <div
                      key={`${entry._type}-${entry.id}`}
                      data-ocid={`share.item.${i + 1}`}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-start gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: isFert
                            ? "oklch(0.93 0.08 145)"
                            : "oklch(0.92 0.07 225)",
                        }}
                      >
                        {isFert ? (
                          <FlaskConical
                            className="w-5 h-5"
                            style={{ color: "oklch(0.45 0.14 145)" }}
                          />
                        ) : (
                          <Wind
                            className="w-5 h-5"
                            style={{ color: "oklch(0.45 0.12 225)" }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm truncate">
                            {name}
                          </span>
                          <Badge
                            className="text-xs shrink-0"
                            style={{
                              background: isFert
                                ? "oklch(0.93 0.08 145)"
                                : "oklch(0.92 0.07 225)",
                              color: isFert
                                ? "oklch(0.38 0.14 145)"
                                : "oklch(0.38 0.12 225)",
                              border: "none",
                            }}
                          >
                            {isFert ? "Fertilizer" : "Spray"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.scheduledDate)}
                          </span>
                          {entry.notes && (
                            <span className="truncate max-w-[200px]">
                              {entry.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-5 text-center">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          © {new Date().getFullYear()}. Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
