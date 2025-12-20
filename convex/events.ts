import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/* ---------------- CREATE EVENT ---------------- */

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),

    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),

    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),

    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    try {
      // ✅ WORKS NOW
      const user = (await ctx.runQuery(
        internal.users.getCurrentUser
      )) as Doc<"users"> | null;

      if (!user) {
        throw new Error("User not authenticated");
      }

      // ✅ hasPro derived from user
      const hasPro = user.hasCompletedOnboarding ? true : false;

      /* -------- VALIDATIONS -------- */

      if (!hasPro && user.freeEventsCreated >= 1) {
        throw new Error(
          "Free event limit reached. Please upgrade to Pro to create more events."
        );
      }

      const DEFAULT_COLOR = "#1e3a8a";

      if (!hasPro && args.themeColor && args.themeColor !== DEFAULT_COLOR) {
        throw new Error(
          "Custom theme colors are a Pro feature. Please upgrade to Pro."
        );
      }

      const themeColor = hasPro ? args.themeColor : DEFAULT_COLOR;

      /* -------- SLUG -------- */

      const slugBase = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      /* -------- CREATE EVENT -------- */

      const eventId = await ctx.db.insert("events", {
        title: args.title,
        description: args.description,
        slug: `${slugBase}-${Date.now()}`,

        organizerId: user._id,
        organizerName: user.name,

        category: args.category,
        tags: args.tags,

        startDate: args.startDate,
        endDate: args.endDate,
        timezone: args.timezone,

        locationType: args.locationType,
        venue: args.venue,
        address: args.address,
        city: args.city,
        state: args.state,
        country: args.country,

        capacity: args.capacity,
        ticketType: args.ticketType,
        ticketPrice: args.ticketPrice,
        registrationCount: 0,

        coverImage: args.coverImage,
        themeColor,

        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated + 1,
        updatedAt: Date.now(),
      });

      return eventId;
    } catch (error: any) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },
});

/* ---------------- GET EVENT BY SLUG ---------------- */

export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/* ---------------- GET MY EVENTS ---------------- */

export const getMyEvents = query({
  handler: async (ctx) => {
    const user = (await ctx.runQuery(
      internal.users.getCurrentUser
    )) as Doc<"users"> | null;

    if (!user) {
      throw new Error("User not authenticated");
    }

    return await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .order("desc")
      .collect();
  },
});

/* ---------------- DELETE EVENT ---------------- */

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },

  handler: async (ctx, args) => {
    const user = (await ctx.runQuery(
      internal.users.getCurrentUser
    )) as Doc<"users"> | null;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const reg of registrations) {
      await ctx.db.delete(reg._id);
    }

    await ctx.db.delete(args.eventId);

    if (event.ticketType === "free" && user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
