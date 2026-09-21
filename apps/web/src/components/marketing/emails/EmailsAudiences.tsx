import { Users } from "lucide-react";
import { ScheduleIllustration } from "./EmailsIllustrations";
import { CARD } from "./emails-cards";

const AUDIENCES = [
  { name: "Product updates", count: "12,480", pct: 82 },
  { name: "Beta testers", count: "1,204", pct: 46 },
  { name: "Enterprise admins", count: "318", pct: 24 },
];

export function AudiencesCard() {
  return (
    <div className={`${CARD} flex flex-col p-6 lg:col-span-2 lg:p-8`}>
      <h3 className="text-lg font-medium">Contacts & audiences</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Track consent, tags, and suppression history for every contact.
      </p>
      <ul className="mt-8 space-y-4">
        {AUDIENCES.map((audience) => (
          <li key={audience.name}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <Users className="size-3.5 text-muted-foreground" />
                {audience.name}
              </span>
              <span className="font-mono text-muted-foreground">
                {audience.count}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-[#A855F7]"
                style={{ width: `${audience.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-4 pt-8">
        <ScheduleIllustration className="h-20 w-auto shrink-0 text-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Schedule broadcasts ahead of time or trigger automations from product
          events.
        </p>
      </div>
    </div>
  );
}
