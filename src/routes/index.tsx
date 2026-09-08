import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUser } from "@/hooks/useSession";
import hero from "@/assets/event-workshop.jpg";

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
    <div className="flex min-h-screen flex-col items-center sm:py-8">
      <div className="border-border bg-canvas relative flex min-h-screen w-full max-w-[412px] flex-col overflow-hidden border-x">
        <div className="bg-rose/25 pointer-events-none absolute -top-16 -left-16 size-56 rounded-full blur-[90px]" />
        <div className="bg-sky/20 pointer-events-none absolute top-40 -right-20 size-56 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-1 flex-col px-6 pt-14 pb-10">
          <p className="text-fog font-mono text-[10px] tracking-[0.25em] uppercase">Campus</p>
          <h1 className="font-display mt-1 text-[44px] leading-[0.95] tracking-tight">
            SEARCHING
            <br />
            EYES
          </h1>
          <p className="text-fog mt-4 text-sm text-pretty">
            One place for every club event, announcement, achievement and conversation — with an
            assistant that knows what's happening this week.
          </p>

          <div className="border-border mt-8 overflow-hidden rounded-[22px] border">
            <img
              src={hero}
              alt="Students at a golden-hour photography workshop on campus"
              width={1024}
              height={640}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>

          <ul className="text-fog mt-6 space-y-2 text-sm">
            <li>
              <span className="text-saffron">▣</span> Events you can join in a tap
            </li>
            <li>
              <span className="text-sky">◧</span> Announcements with urgency that reads at a glance
            </li>
            <li>
              <span className="text-jade">◉</span> A student-only community board
            </li>
          </ul>

          <div className="mt-auto pt-8">
            <Link
              to="/auth"
              className="bg-saffron text-canvas block w-full rounded-xl py-3.5 text-center text-sm font-semibold"
            >
              Sign in with your university email
            </Link>
            <p className="text-fog mt-3 text-center font-mono text-[10px] tracking-wider">
              MEMBERS ONLY · SEARCHING EYES
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
