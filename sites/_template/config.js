// TEMPLATE — copy this folder to sites/<your-site-id>/ to add a new website.
// Then register it in sites/index.js and embed with data-site="<your-site-id>".

import { knowledge } from './knowledge.js';

export default {
  // Unique id. The widget selects this tenant via data-site="my-site".
  id: 'my-site',

  // Display/name the bot uses for itself in prompts.
  botName: 'MySiteBot',

  // Who the bot is and what it represents. Persona only — generic rules
  // (answer-from-knowledge-only, refusals, language mirroring) are added
  // automatically by api/_prompt.js.
  persona: `You are "MySiteBot", the AI assistant on the My Site website.
Your job: answer visitors' questions about My Site — what it does, features,
pricing, and how to get support.`,

  // One line describing what's in-scope. Used in the refusal rule.
  scope: 'questions about My Site — its features, usage, and support',

  // Where to point visitors when the knowledge doesn't cover something.
  fallbackContact: 'contact support at support@example.com',

  knowledge,
};
