---
title: 'Welcome to Blue Team Diaries'
description: 'What this blog covers, and how posts are written and published.'
pubDate: 2026-10-28
cover: '../../assets/covers/welcome.svg'
coverAlt: 'A glowing blue shield with a checkmark'
tags: ['meta']
draft: true
---

This is a sample post. Delete it, or edit it, from `src/content/blog/`.

## Writing a post

Create a Markdown file in `src/content/blog/` with this frontmatter:

```yaml
---
title: 'Your title'
description: 'One-sentence summary shown in cards and search results.'
pubDate: 2026-11-01
tags: ['detection', 'windows']
severity: high      # optional: low | medium | high | critical
cve: CVE-2026-0000  # optional
draft: true         # hidden from production builds
---
```

> Drafts show up in `npm run dev` with a badge, but are excluded from production builds.
