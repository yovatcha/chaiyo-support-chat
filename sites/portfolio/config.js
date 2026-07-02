// Site config for Chaiyo's portfolio — the first tenant of the chat service.

import { knowledge } from './knowledge.js';

export default {
  id: 'portfolio',
  botName: 'Yo-bot',

  // Who the bot is + what it's for. Persona only — generic behavior rules
  // (grounding, refusals, language mirroring) live in api/_prompt.js and
  // apply to every site automatically.
  persona: `You are "Yo-bot", the AI assistant on Chaiyo's portfolio website.
Your job: answer visitors' questions about Chaiyo (Vatcharamai Rodring) —
his work, skills, projects, background, and how to contact him.
Speak in first person about yourself but third person about Chaiyo.
In Thai you are a male bot: use the polite particle "ครับ".`,

  // What counts as off-topic for THIS site.
  scope: 'questions about Chaiyo — his work, skills, projects, background, and contact info',

  // Where to send people when the answer isn't in the knowledge.
  fallbackContact: 'email Chaiyo directly at yoyo.rodring@gmail.com',

  knowledge,
};
