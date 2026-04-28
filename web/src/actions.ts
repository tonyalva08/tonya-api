export const ACTIONS = [
  {
    id: 'rebrand',
    label: 'Rebrand',
    description: 'Comprehensive brand identity refresh',
  },
  {
    id: 'programmatic-ads',
    label: 'Programmatic Geotargeted Ads',
    description: 'Hyper-targeted digital campaign across geographies',
  },
  {
    id: 'irl-campaign',
    label: 'IRL Campaign',
    description: 'Real-world activations, OOH, and live events',
  },
  {
    id: 'super-bowl',
    label: 'Super Bowl / High-Impact Placement',
    description: 'Tier-1 broadcast or premium media placement',
  },
  {
    id: 'new-product',
    label: 'New Product Design',
    description: 'Net-new product line or category extension',
  },
  {
    id: 'ux-redesign',
    label: 'UX/UI App Redesign',
    description: 'End-to-end product experience overhaul',
  },
  {
    id: 'long-form-video',
    label: 'Long-Form Video Content',
    description: 'Episode-length video series',
  },
  {
    id: 'short-form-social',
    label: 'Short-Form / Social Content',
    description: 'TikTok, Reels, and Shorts production',
  },
] as const;

export type Action = (typeof ACTIONS)[number];
export type ActionId = Action['id'];
