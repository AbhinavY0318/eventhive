import { mutation, internalQuery } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/* ---------------- STORE USER ---------------- */

export const store = mutation({
  args: {},
  handler: async (ctx): Promise<Id<"users">> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    // Update existing user
    if (existingUser) {
      if (existingUser.name !== identity.name) {
        await ctx.db.patch(existingUser._id, {
          name: identity.name ?? existingUser.name,
          updatedAt: Date.now(),
        });
      }
      return existingUser._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
      hasCompletedOnboarding: false,
      freeEventsCreated: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/* ---------------- INTERNAL GET CURRENT USER ---------------- */
/* THIS IS THE KEY FIX */

export const getCurrentUser = internalQuery({
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("Authenticated user not found in database");
    }

    return user;
  },
});
