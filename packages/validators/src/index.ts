// ============================================================================
// BowlersNetwork — Shared Validation Schemas (Zod)
// ============================================================================
// Used on BOTH frontend (React Hook Form) and backend (NestJS pipes).
// Single source of truth for all validation rules.
// ============================================================================

import { z } from "zod";

// --- Auth Schemas ------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(12, "Username must be at most 12 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

// --- Game Schemas ------------------------------------------------------------

export const gameSetupSchema = z.object({
  hand: z.enum(["left", "right"]),
  oil_pattern: z.enum(["house", "sport", "challenge", "custom"]),
  lane_condition: z.enum(["oily", "dry", "medium"]),
  game_type: z.enum(["practice", "league", "tournament"]),
  lane_number: z.string().optional(),
});

// --- Tournament Schemas ------------------------------------------------------

export const createTournamentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(1000).optional(),
  start_date: z.string().datetime(),
  reg_deadline: z.string().datetime(),
  format: z.enum(["singles", "doubles", "teams"]),
  type: z.enum(["handicap", "scratch"]),
  reg_fee: z.number().min(0),
  prize_pool: z.number().min(0).optional(),
  address: z.string().optional(),
  max_participants: z.number().int().positive().optional(),
});

// --- League Schemas ----------------------------------------------------------

export const createLeagueSchema = z.object({
  name: z.string().min(3).max(100),
  day: z.string(),
  time: z.string(),
  duration_weeks: z.number().int().positive(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  format: z.enum(["singles", "doubles", "teams"]),
  game_type: z.enum(["handicap", "scratch", "mixed"]),
  entry_fee: z.number().min(0),
  prize_pool: z.number().min(0).optional(),
  max_participants: z.number().int().positive().optional(),
});

// --- Post Schemas ------------------------------------------------------------

export const createPostSchema = z.object({
  content: z.string().min(1, "Post cannot be empty").max(5000),
  media: z.array(z.string().url()).max(10).optional(),
});

// --- Message Schemas ---------------------------------------------------------

export const sendMessageSchema = z.object({
  text: z.string().min(1).max(5000),
  media: z.array(z.string().url()).max(5).optional(),
});

// --- Team Schemas ------------------------------------------------------------

export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(50),
  logo_url: z.string().url().optional(),
});

// --- Product Schemas ---------------------------------------------------------

export const createProductSchema = z.object({
  name: z.string().min(2).max(100),
  brand: z.string().min(1),
  category: z.enum(["Balls", "Shoes", "Apparel", "Accessories"]),
  price: z.number().positive(),
  original_price: z.number().positive().optional(),
  condition: z.enum(["new", "like-new", "good", "fair"]),
  description: z.string().max(2000).optional(),
  stock: z.number().int().min(0),
});

// --- Type Exports (inferred from schemas) ------------------------------------

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type GameSetupInput = z.infer<typeof gameSetupSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
