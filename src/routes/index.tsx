import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUser } from "@/hooks/useSession";
import hero from "@/assets/event-workshop.jpg";
import { ArrowRight, CalendarDays, Megaphone, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Searching Eyes — University Student Community" },
      {
        name: "description",
        content:
          "Discover club events, read announcements, browse the activity archive and talk with fellow members — all in one Searching Eyes app.",
      },
      { property: "og:title", content: "Searching Eyes — University Student Community" },
      {
        property: "og:description",
        content: "Events, announcements, activities and community for Searching Eyes members.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/home", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="bg-canvas min-h-screen">
      <header className="border-border bg-card/90 sticky top-0 z-20 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="bg-ink text-card grid size-8 place-items-center rounded-lg font-display font-bold">S</span>
            <span className="font-display font-semibold">Searching Eyes</span>
          </Link>
          <Link to="/auth" className="text-primary text-sm font-medium">Sign in</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-12 lg:py-28">
          <div className="rise max-w-2xl">
            <p className="text-primary text-sm font-semibold">The official MDU student community</p>
            <h1 className="font-display mt-5 text-5xl leading-[1.02] font-semibold sm:text-6xl lg:text-7xl">
              Campus life,
              <br />clearly connected.
            </h1>
            <p className="text-fog mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
              Discover events, follow important updates, celebrate student work, and join meaningful conversations in one trusted place.
            </p>

            <div className="border-border mt-10 overflow-hidden rounded-2xl border lg:hidden">
              <img
                src={hero}
                alt="Students at a golden-hour photography workshop on campus"
                width={1024}
                height={640}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground press inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
              >
                Continue with MDU email <ArrowRight className="size-4" />
              </Link>
              <span className="text-fog text-sm">Only @mdu.edu.in accounts</span>
            </div>
          </div>

          <div className="rise border-border hidden overflow-hidden rounded-2xl border shadow-[0_24px_80px_-40px_rgba(0,0,0,.35)] lg:block">
            <img
              src={hero}
              alt="Students at a golden-hour photography workshop on campus"
              width={1024}
              height={640}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </section>

        <section className="bg-card border-border border-y">
          <div className="stagger mx-auto grid max-w-7xl gap-0 px-5 py-8 sm:px-8 md:grid-cols-3 lg:px-12">
            {[
              [CalendarDays, "Events", "Find what is happening and reserve your place."],
              [Megaphone, "Updates", "See essential notices without the noise."],
              [MessagesSquare, "Community", "Connect with verified MDU students."],
            ].map(([Icon, title, text], index) => (
              <div key={String(title)} className={`py-7 md:px-8 ${index > 0 ? "border-border border-t md:border-t-0 md:border-l" : ""}`}>
                <Icon className="text-primary size-6" />
                <h2 className="font-display mt-5 text-xl font-semibold">{String(title)}</h2>
                <p className="text-fog mt-2 max-w-xs text-sm leading-relaxed">{String(text)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
