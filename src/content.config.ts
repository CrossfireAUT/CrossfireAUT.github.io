import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    // Cover image: path relative to the post, e.g. '../../assets/covers/my-post.png'
    cover: image().optional(),
    coverAlt: z.string().default(''),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Optional severity badge for vulnerability write-ups
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    cve: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
