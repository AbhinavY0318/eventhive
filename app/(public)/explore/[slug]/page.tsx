"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { CATEGORIES } from "@/lib/data";
import { parseLocationSlug } from "@/lib/location-utils";
import { Badge } from "@/components/ui/badge";
import EventCard, { Event } from "@/components/event-card";

/* ---------------------------------------------
   Category type
---------------------------------------------- */
type Category = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

export default function DynamicExplorePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  /* ---------- CATEGORY CHECK ---------- */
  const categoryInfo = CATEGORIES.find(
    (cat: Category) => cat.id === slug
  );
  const isCategory = Boolean(categoryInfo);

  /* ---------- LOCATION CHECK ---------- */
  const { city, state, isValid } = !isCategory
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: true };

  /* ---------- INVALID ROUTE ---------- */
  if (!isCategory && !isValid) {
    notFound();
  }

  /* ---------- FETCH EVENTS ---------- */
  const { data: events, isLoading } =
    useConvexQuery<Event[]>(
      isCategory
        ? api.explore.getEventsByCategory
        : api.explore.getEventsByLocation,
      isCategory
        ? { category: slug, limit: 50 }
        : city && state
        ? { city, state, limit: 50 }
        : undefined
    );

  /* ---------- NAVIGATION ---------- */
  const handleEventClick = (eventSlug: string) => {
    router.push(`/events/${eventSlug}`);
  };

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  /* ================= CATEGORY VIEW ================= */
  if (isCategory && categoryInfo) {
    return (
      <>
        <div className="pb-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{categoryInfo.icon}</div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold">
                {categoryInfo.label}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {categoryInfo.description}
              </p>
            </div>
          </div>

          {events && events.length > 0 && (
            <p className="text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No events found in this category.
          </p>
        )}
      </>
    );
  }

  /* ================= LOCATION VIEW ================= */
  return (
    <>
      <div className="pb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">📍</div>
          <div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Events in {city}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {state}, India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2">
            <MapPin className="w-3 h-3" />
            {city}, {state}
          </Badge>

          {events && events.length > 0 && (
            <p className="text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No events in {city}, {state} yet.
        </p>
      )}
    </>
  );
}
