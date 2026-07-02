// Site registry — every website the chat service can serve.
//
// To add a new site:
//   1. Copy sites/_template/ to sites/<id>/ and fill in config + knowledge.
//   2. Import it here and add it to SITES.
//   3. Embed on that website with:  data-site="<id>"
//
// The widget defaults to "portfolio" when no data-site is given.

import portfolio from './portfolio/config.js';

export const SITES = {
  [portfolio.id]: portfolio,
};

export const DEFAULT_SITE = 'portfolio';
