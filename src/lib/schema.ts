import { z } from "zod";
import { EVENT_TYPES } from "./dictionary";

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])?$/;

export const rsvpInput = z.object({
  slug: z.string().regex(SLUG_RE),
  guestToken: z.string().regex(/^[A-Za-z0-9_-]{6,32}$/).nullish(),
  name: z.string().min(1).max(200),
  attending: z.boolean(),
  count: z.number().int().min(1).max(10),
  wish: z.string().max(2000).nullish(),
  website: z.string().max(200).optional(), // honeypot
});

export const eventTypeSchema = z.enum(EVENT_TYPES);
