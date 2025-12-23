"use client";

import { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import Image from "next/image";
import { Event } from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CATEGORIES } from "@/lib/data";
import Autoplay from "embla-carousel-autoplay";
import EventCard from "@/components/event-card";

/* ---------------- TYPES ---------------- */

type User = {
  _id: string;
  email: string;
  name: string;
  imageUrl?: string;
  hasCompletedOnboarding: boolean;
  freeEventsCreated: number;
  interests?: string[];
  location?: {
    city: string;
    state?: string;
    country: string;
  };
};

/* ---------------- PAGE ---------------- */

export default function ExplorePage() {
  const router = useRouter();

  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false })
  );

  /* -------- Current User -------- */
  const { data: currentUser } =
    useConvexQuery<User>(api.users.getCurrentUser);

  /* -------- Featured Events -------- */
  const { data: featuredEvents, isLoading: loadingFeatured } =
    useConvexQuery<Event[]>(api.explore.getFeaturedEvents, { limit: 3 });

  /* -------- Local Events -------- */
  const { data: localEvents, isLoading: loadingLocal } =
    useConvexQuery<Event[]>(api.explore.getEventsByLocation, {
      city: currentUser?.location?.city ?? "Gurugram",
      state: currentUser?.location?.state ?? "Haryana",
      limit: 4,
    });

  /* -------- Popular Events -------- */
  const { data: popularEvents, isLoading: loadingPopular } =
    useConvexQuery<Event[]>(api.explore.getPopularEvents, { limit: 6 });

  const { data: categoryCounts } =
    useConvexQuery<Record<string, number>>(
      api.explore.getCategoryCounts
    );

  const isLoading = loadingFeatured || loadingLocal || loadingPopular;

  /* ---------------- HELPERS ---------------- */

  const handleEventClick = (slug: string) => {
    router.push(`/events/${slug}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/explore/${categoryId}`);
  };

  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Gurugram";
    const state = currentUser?.location?.state || "Haryana";
    router.push(`/explore/${createLocationSlug(city, state)}`);
  };

  /* ----------------  INTEREST PRIORITY LOGIC ---------------- */

  const sortByUserInterests = (
    events: Event[] = [],
    interests: string[] = []
  ) => {
    if (!interests.length) return events;

    const interested = events.filter((event) =>
      interests.includes(event.category)
    );

    const others = events.filter(
      (event) => !interests.includes(event.category)
    );

    return [...interested, ...others];
  };

  const sortedLocalEvents = useMemo(() => {
    return sortByUserInterests(
      localEvents ?? [],
      currentUser?.interests ?? []
    );
  }, [localEvents, currentUser?.interests]);

  const sortedPopularEvents = useMemo(() => {
    return sortByUserInterests(
      popularEvents ?? [],
      currentUser?.interests ?? []
    );
  }, [popularEvents, currentUser?.interests]);

  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts?.[cat.id] || 0,
  }));

  /* ---------------- LOADING ---------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Discover Events
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore featured events, find what's happening locally, or browse
          events across India
        </p>

        {/* -------- Featured Carousel -------- */}
        <div className="mb-16">
          <Carousel
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {featuredEvents?.map((event) => (
                <CarouselItem key={event._id}>
                  <div
                    className="relative h-100 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => handleEventClick(event.slug)}
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: event.themeColor }}
                      />
                    )}

                    <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/30" />

                    <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                      <Badge className="w-fit mb-4" variant="secondary">
                        {event.city}, {event.state || event.country}
                      </Badge>

                      <h2 className="text-3xl md:text-5xl font-bold mb-3 text-white">
                        {event.title}
                      </h2>

                      <p className="text-lg text-white/90 mb-4 max-w-2xl line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(event.startDate, "PPP")}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.city}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.registrationCount} registered
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* -------- Events Near You -------- */}
        {sortedLocalEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-1">Events Near You</h2>
                <p className="text-muted-foreground">
                  Happening in {currentUser?.location?.city || "your area"}
                </p>
              </div>

              <Button variant="outline" onClick={handleViewLocalEvents}>
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sortedLocalEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  variant="compact"
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* -------- Browse by Category -------- */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Browse by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesWithCounts.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="text-3xl">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold">{category.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} events
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* -------- Popular Events -------- */}
        {sortedPopularEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">
              Popular Across India
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPopularEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  variant="list"
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Empty State */}
      {!loadingFeatured &&
        !loadingLocal &&
        !loadingPopular &&
        (!featuredEvents || featuredEvents.length === 0) &&
        (!localEvents || localEvents.length === 0) &&
        (!popularEvents || popularEvents.length === 0) && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className="text-muted-foreground">
                Be the first to create an event in your area!
              </p>
              <Button asChild className="gap-2">
                <a href="/create-event">Create Event</a>
              </Button>
            </div>
          </Card>
        )}
    </>
  );
}



          
    
