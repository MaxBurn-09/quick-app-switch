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
    <div className="flex min-h-screen flex-col items-center">
      <div className="border-border bg-canvas relative flex min-h-screen w-full max-w-[412px] flex-col overflow-hidden border-x lg:max-w-6xl lg:border-x-0">
        <div className="bg-rose/25 pointer-events-none absolute -top-16 -left-16 size-56 rounded-full blur-[90px] lg:size-96" />
        <div className="bg-sky/20 pointer-events-none absolute top-40 -right-20 size-56 rounded-full blur-[100px] lg:size-96" />

        <div className="relative z-10 flex flex-1 flex-col px-6 pt-14 pb-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16 lg:py-0">
          <div className="flex flex-col lg:py-16">
            <p className="text-fog font-mono text-[10px] tracking-[0.25em] uppercase lg:text-xs">
              Campus
            </p>
            <h1 className="font-display mt-1 text-[44px] leading-[0.95] tracking-tight lg:text-8xl">
              SEARCHING
              <br />
              EYES
            </h1>
            <p className="text-fog mt-4 max-w-md text-sm text-pretty lg:mt-6 lg:text-lg">
              One place for every club event, announcement, achievement and conversation — with an
              assistant that knows what's happening this week.
            </p>

            <div className="border-border mt-8 overflow-hidden rounded-[22px] border lg:hidden">
              <img
                src={hero}
                alt="Students at a golden-hour photography workshop on campus"
                width={1024}
                height={640}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <ul className="text-fog mt-6 space-y-2 text-sm lg:mt-10 lg:space-y-3 lg:text-base">
              <li>
                <span className="text-saffron">▣</span> Events you can join in a tap
              </li>
              <li>
                <span className="text-sky">◧</span> Announcements with urgency that reads at a
                glance
              </li>
              <li>
                <span className="text-jade">◉</span> A student-only community board
              </li>
            </ul>

            <div className="mt-auto pt-8 lg:mt-12 lg:max-w-sm lg:pt-0">
              <Link
                to="/auth"
                className="bg-saffron text-canvas block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 lg:py-4 lg:text-base"
              >
                Sign in with your university email
              </Link>
              <p className="text-fog mt-3 text-center font-mono text-[10px] tracking-wider lg:text-left">
                MEMBERS ONLY · SEARCHING EYES
              </p>
            </div>
          </div>

          <div className="border-border hidden overflow-hidden rounded-[28px] border shadow-2xl lg:block">
            <img
              src={hero}
              alt="Students at a golden-hour photography workshop on campus"
              width={1024}
              height={640}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
