// ============================================================================
// BowlersNetwork — Shared Type Definitions
// ============================================================================
// Single source of truth for all entity types across the ecosystem.
// All 7 apps and the API import from here — never define types locally.
// ============================================================================

// --- Roles -------------------------------------------------------------------

export type UserRole =
  | "amateur"
  | "pro"
  | "center_admin"
  | "tournament_director"
  | "office_staff"
  | "office_admin";

export interface UserRoles {
  is_pro: boolean;
  is_center_admin: boolean;
  is_tournament_director: boolean;
  is_office_staff: boolean;
  is_office_admin: boolean;
}

// --- User --------------------------------------------------------------------

export interface User {
  user_id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: UserRoles;
  xp: number;
  level: number;
  profile_picture_url: string | null;
  cover_picture_url: string | null;
  intro_video_url: string | null;
  bio: string | null;
  follow_info: {
    followers: number;
    followings: number;
  };
}

// --- Auth --------------------------------------------------------------------

export interface AuthResponse {
  user: User;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

// --- Bowling Game -------------------------------------------------------------

export type HandPreference = "left" | "right";
export type OilPattern = "house" | "sport" | "challenge" | "custom";
export type LaneCondition = "oily" | "dry" | "medium";
export type GameType = "practice" | "league" | "tournament";

export interface BowlingThrow {
  knocked_pins: number[];
  is_foul: boolean;
}

export interface BowlingFrame {
  number: number;
  throws: BowlingThrow[];
  is_pocket_hit: boolean;
}

export interface BowlingGame {
  id: number;
  frames: BowlingFrame[];
  total_score: number;
  date: string;
  is_complete: boolean;
  hand: HandPreference;
  oil_pattern: OilPattern;
  lane_condition: LaneCondition;
  game_type: GameType;
  lane_number: string | null;
}

export interface GameStats {
  games_played: number;
  avg_score: number;
  high_score: number;
  low_score: number;
  total_strikes: number;
  total_spares: number;
  total_fouls: number;
  strike_rate: number;
  spare_rate: number;
  pocket_hit_rate: number;
}

// --- Social Feed -------------------------------------------------------------

export interface FeedPost {
  id: number;
  author: User;
  content: string;
  media: string[];
  post_type: "default" | "poll" | "shared";
  likes: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface FeedComment {
  comment_id: number;
  user: User;
  text: string;
  media: string[];
  created_at: string;
}

// --- Messaging ---------------------------------------------------------------

export interface Conversation {
  room_id: number;
  name: string;
  display_name: string;
  display_image_url: string | null;
  type: "private" | "group";
  last_message: Message | null;
  unread_count: number;
}

export interface Message {
  id: number;
  room_id: number;
  sender: Pick<User, "user_id" | "username" | "name" | "profile_picture_url">;
  text: string;
  media: string[];
  sent_at: string;
  sent_by_me: boolean;
}

// --- Teams -------------------------------------------------------------------

export interface Team {
  team_id: number;
  name: string;
  logo_url: string | null;
  created_by: User;
  created_at: string;
  chat_room_id: number;
  member_count: number;
}

export interface TeamMember {
  member_id: number;
  member: User;
  is_creator: boolean;
}

// --- Tournaments -------------------------------------------------------------

export type TournamentFormat = "singles" | "doubles" | "teams";
export type TournamentType = "handicap" | "scratch";
export type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled" | "draft";

export interface Tournament {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  reg_deadline: string;
  format: TournamentFormat;
  type: TournamentType;
  reg_fee: number;
  prize_pool: number | null;
  address: string | null;
  max_participants: number | null;
  already_enrolled: number;
  status: TournamentStatus;
}

// --- Leagues -----------------------------------------------------------------

export type LeagueStatus = "active" | "upcoming" | "completed" | "draft";

export interface League {
  id: number;
  name: string;
  day: string;
  time: string;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  format: TournamentFormat;
  game_type: "handicap" | "scratch" | "mixed";
  entry_fee: number;
  prize_pool: number | null;
  max_participants: number | null;
  status: LeagueStatus;
}

export interface LeagueStanding {
  rank: number;
  name: string;
  wins: number;
  losses: number;
  points: number;
  average: number;
  high_game: number;
}

// --- Events ------------------------------------------------------------------

export interface PlayerEvent {
  event_id: number;
  title: string;
  description: string | null;
  event_datetime: string;
  location: {
    address_str: string;
    lat: string;
    long: string;
  };
  total_interested: number;
  is_interested: boolean;
  flyer_url: string | null;
}

// --- Bowling Center ----------------------------------------------------------

export interface BowlingCenter {
  id: number;
  name: string;
  logo: string | null;
  lanes: number;
  address_str: string;
  lat: string;
  long: string;
  zipcode: string;
  website_url: string | null;
  email: string | null;
  phone_number: string | null;
}

// --- Brands & Products -------------------------------------------------------

export type BrandCategory = "Balls" | "Shoes" | "Apparel" | "Accessories";
export type ProductStatus = "active" | "draft" | "archived";
export type ProductCondition = "new" | "like-new" | "good" | "fair";

export interface Brand {
  brand_id: number;
  brand_type: BrandCategory;
  name: string;
  formal_name: string;
  logo_url: string;
  is_fav: boolean;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: BrandCategory;
  price: number;
  original_price: number | null;
  discount: number | null;
  condition: ProductCondition;
  description: string | null;
  images: string[];
  stock: number;
  status: ProductStatus;
}

// --- Trading Cards -----------------------------------------------------------

export type CardRarity = "common" | "rare" | "legendary";

export interface TradingCard {
  card_id: number;
  user_id: number;
  design: {
    design_id: number;
    name: string;
    code_name: string;
  };
  card_html_url: string;
  is_collected_by_viewer: boolean;
  collections_count: number;
}

// --- Discussions (Chatter) ---------------------------------------------------

export interface ChatterTopic {
  topic_id: number;
  name: string;
  description: string;
  banner_url: string | null;
  is_hidden: boolean;
}

export interface Discussion {
  id: number;
  title: string;
  description: string;
  author: User;
  topic_id: number;
  replies_count: number;
  created_at: string;
}

// --- WebSocket Events --------------------------------------------------------

export interface WsEvents {
  // Client → Server
  "message:send": { room_id: number; text: string; media: string[] };
  "message:typing": { room_id: number };
  "room:join": { room_id: number };
  "room:leave": { room_id: number };

  // Server → Client
  "message:new": Message;
  "message:typing_indicator": { room_id: number; user: Pick<User, "user_id" | "username"> };
  "notification:new": { type: string; title: string; body: string };
}
