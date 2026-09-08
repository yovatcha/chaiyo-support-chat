// Size caps for bot fields, shared by the dashboard form and its server
// action. persona/scope/fallback are part of every system prompt and
// knowledge is the bulk of it; Groq's free tier is limited per minute, so an
// oversized knowledge base would make every chat request fail with 429.
export const LIMITS = {
  bot_name: 60,
  title: 60,
  description: 120,
  greeting: 500,
  placeholder: 80,
  persona: 2000,
  scope: 300,
  fallback_contact: 300,
  knowledge: 24000,
  allowed_origins: 20,
};
