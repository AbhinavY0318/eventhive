import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/* =========================
   CREATE EVENT
========================= */

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
    hasPro: v.optional(v.boolean()),
  },

  handler: async (ctx, args): Promise<Doc<"events">["_id"]> => {
    const user = await ctx.runQuery(internal.users.getCurrentUserInternal);
    
if (!user) {
  throw new Error("Unauthorized");
}

    const hasPro = args.hasPro ?? false;

    /* ---- FREE PLAN LIMIT ---- */
    if (!hasPro && user.freeEventsCreated >= 1) {
      throw new Error(
        "Free event limit reached. Please upgrade to Pro to create more events."
      );
    }

    /* ---- THEME COLOR CHECK ---- */
    const defaultColor = "#1e3a8a";

    if (!hasPro && args.themeColor && args.themeColor !== defaultColor) {
      throw new Error(
        "Custom theme colors are a Pro feature. Please upgrade to Pro."
      );
    }

    const themeColor = hasPro ? args.themeColor : defaultColor;

    /* ---- SLUG GENERATION ---- */
    const baseSlug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    /* ---- CREATE EVENT ---- */
    const eventId = await ctx.db.insert("events", {
      ...args,
      themeColor,
      slug: `${baseSlug}-${Date.now()}`,
      organizerId: user._id,
      organizerName: user.name,
      registrationCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    /* ---- UPDATE USER COUNT ---- */
    if (!hasPro) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated + 1,
      });
    }

    return eventId;
  },
});

/* =========================
   GET EVENT BY SLUG
========================= */

export const getEventBySlug = query({
  args: { slug: v.string() },

  handler: async (
    ctx,
    args
  ): Promise<Doc<"events"> | null> => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/* =========================
   GET MY EVENTS
========================= */

export const getMyEvents = query({
  handler: async (ctx): Promise<Doc<"events">[]> => {
    const user = await ctx.runQuery(internal.users.getCurrentUserInternal);
    
if (!user) {
  throw new Error("Unauthorized");
}
    return await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .order("desc")
      .collect();
  },
});

/* =========================
   DELETE EVENT
========================= */

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },

  handler: async (
    ctx,
    args
  ): Promise<{ success: true }> => {
    const user = await ctx.runQuery(internal.users.getCurrentUserInternal);
    
if (!user) {
  throw new Error("Unauthorized");
}

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    }

    /* ---- DELETE REGISTRATIONS ---- */
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const registration of registrations) {
      await ctx.db.delete(registration._id);
    }

    /* ---- DELETE EVENT ---- */
    await ctx.db.delete(args.eventId);

    /* ---- UPDATE USER COUNT ---- */
    if (event.ticketType === "free" && user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1,
      });
    }

    return { success: true };
  },
});
