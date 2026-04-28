export const SECTORS = [
  'B2B SaaS',
  'CPG',
  'Climate Tech',
  'Health',
  'Fintech',
  'E-Commerce',
  'Media',
] as const;

export type Sector = (typeof SECTORS)[number];
