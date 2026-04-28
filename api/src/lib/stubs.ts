import type { ParsedHomepage } from './parseHomepage';
import type { MarketSnapshot, Sector } from './snapshot';

export type ActionId =
  | 'rebrand'
  | 'programmatic-ads'
  | 'irl-campaign'
  | 'super-bowl'
  | 'new-product'
  | 'ux-redesign'
  | 'long-form-video'
  | 'short-form-social';

export interface ProjectionRange {
  low: number;
  mid: number;
  high: number;
  unit: 'percent_lift';
}

export interface CaseStudy {
  company: string;
  outcome: string;
  source: string;
}

export interface ROIProfile {
  projectionRange: ProjectionRange;
  caseStudy: CaseStudy;
  shortTermImpact: string;
  longTermImpact: string;
  confidence: 'low' | 'medium' | 'high';
}

interface SectorSnapshotTemplate {
  stage: MarketSnapshot['stage'];
  competitors: MarketSnapshot['competitors'];
  positioningTemplate: string;
}

const SNAPSHOT_TEMPLATES: Record<Sector, SectorSnapshotTemplate> = {
  'B2B SaaS': {
    stage: 'growth',
    competitors: [
      { name: 'Linear', positioning: 'Developer-first issue tracker' },
      { name: 'Notion', positioning: 'All-in-one workspace for teams' },
      { name: 'Asana', positioning: 'Cross-functional work management' },
      { name: 'ClickUp', positioning: 'Productivity OS for fast-moving teams' },
    ],
    positioningTemplate:
      '{name} is a B2B SaaS product in the team productivity category, building against incumbents like Linear and Notion.',
  },
  CPG: {
    stage: 'growth',
    competitors: [
      { name: 'Olipop', positioning: 'Prebiotic soda, healthier indulgence' },
      { name: 'Liquid Death', positioning: 'Heavy-metal aesthetic, premium water' },
      { name: 'Magic Spoon', positioning: 'High-protein cereal, adult breakfast' },
      { name: 'Athletic Brewing', positioning: 'Non-alcoholic craft beer' },
    ],
    positioningTemplate:
      '{name} is a challenger CPG brand positioned against legacy incumbents, targeting health-and-style-conscious millennials.',
  },
  'Climate Tech': {
    stage: 'growth',
    competitors: [
      { name: 'Watershed', positioning: 'Enterprise carbon accounting' },
      { name: 'Patch', positioning: 'Carbon removal API' },
      { name: 'Persefoni', positioning: 'ESG and emissions reporting' },
      { name: 'Sweep', positioning: 'Sustainability data infrastructure' },
    ],
    positioningTemplate:
      '{name} is a climate tech company in the decarbonization stack, competing for enterprise sustainability budgets.',
  },
  Health: {
    stage: 'growth',
    competitors: [
      { name: 'Hims', positioning: 'Direct-to-consumer wellness brand' },
      { name: 'Ro', positioning: 'Telehealth platform with care delivery' },
      { name: 'Whoop', positioning: 'Performance wearable + coaching' },
      { name: 'Calm', positioning: 'Consumer mental wellness app' },
    ],
    positioningTemplate:
      '{name} is a health and wellness company in the consumer health category, competing on trust and outcomes.',
  },
  Fintech: {
    stage: 'growth',
    competitors: [
      { name: 'Mercury', positioning: 'Banking platform for startups' },
      { name: 'Brex', positioning: 'Spend management for growth companies' },
      { name: 'Ramp', positioning: 'Corporate cards with savings automation' },
      { name: 'Plaid', positioning: 'Open finance infrastructure' },
    ],
    positioningTemplate:
      '{name} is a fintech company positioned against traditional banks, built for the modern operator stack.',
  },
  'E-Commerce': {
    stage: 'growth',
    competitors: [
      { name: 'Allbirds', positioning: 'Sustainable everyday footwear' },
      { name: 'Glossier', positioning: 'Beauty brand born on Instagram' },
      { name: 'Warby Parker', positioning: 'Direct-to-consumer eyewear' },
      { name: 'Aimé Leon Dore', positioning: 'NYC-rooted lifestyle brand' },
    ],
    positioningTemplate:
      '{name} is a direct-to-consumer e-commerce brand positioned against legacy retail, leading with brand and CRO discipline.',
  },
  Media: {
    stage: 'growth',
    competitors: [
      { name: 'Substack', positioning: 'Creator-owned newsletter platform' },
      { name: 'Patreon', positioning: 'Creator membership infrastructure' },
      { name: 'The Athletic', positioning: 'Sports journalism subscription' },
      { name: 'Beehiiv', positioning: 'Newsletter platform for ad-supported creators' },
    ],
    positioningTemplate:
      '{name} is a media company in the creator-economy stack, building audience and recurring revenue.',
  },
};

function deriveCompanyName(parsed: ParsedHomepage): string {
  const candidate = parsed.title || parsed.h1;
  if (!candidate) return 'This company';
  return candidate.split(/[—|•·:|-]/)[0].trim() || 'This company';
}

export function generateStubSnapshot(
  parsed: ParsedHomepage,
  sector: Sector,
): MarketSnapshot {
  const template = SNAPSHOT_TEMPLATES[sector];
  const name = deriveCompanyName(parsed);
  return {
    stage: template.stage,
    competitors: template.competitors.slice(0, 3),
    positioning: template.positioningTemplate.replace('{name}', name),
  };
}

interface ActionTemplate {
  projectionRange: ProjectionRange;
  shortTermImpact: string;
  longTermImpact: string;
  confidence: 'low' | 'medium' | 'high';
  caseStudy: CaseStudy;
}

const ACTION_TEMPLATES: Record<ActionId, ActionTemplate> = {
  rebrand: {
    projectionRange: { low: 8, mid: 15, high: 25, unit: 'percent_lift' },
    shortTermImpact:
      'Brand awareness lift in 30-60 days via earned media and direct traffic spikes.',
    longTermImpact:
      'Compounding pricing power and improved retention over 12-18 months as positioning sharpens.',
    confidence: 'high',
    caseStudy: {
      company: 'Mailchimp',
      outcome:
        '2018 rebrand expanded the company beyond email into a broader marketing platform; acquired by Intuit for $12B in 2021.',
      source: 'Intuit press release, 2021',
    },
  },
  'programmatic-ads': {
    projectionRange: { low: 5, mid: 12, high: 22, unit: 'percent_lift' },
    shortTermImpact:
      'CAC reduction visible in 30-60 days as creative-audience-channel matrix tightens.',
    longTermImpact:
      'Sustained LTV growth as targeting models compound on first-party signal.',
    confidence: 'high',
    caseStudy: {
      company: 'Casper',
      outcome:
        'Programmatic + podcast attribution scaled DTC mattress sales from $0 to $750M in five years.',
      source: 'Adweek, 2019',
    },
  },
  'irl-campaign': {
    projectionRange: { low: 3, mid: 8, high: 18, unit: 'percent_lift' },
    shortTermImpact:
      'Earned media lift and social-share spike in the 30-day window post-activation.',
    longTermImpact:
      'Brand-association moat that paid channels cannot easily replicate.',
    confidence: 'medium',
    caseStudy: {
      company: 'Liquid Death',
      outcome:
        'IRL skate-park and music-festival activations drove 89% YoY DTC revenue growth in 2022 and a $700M valuation.',
      source: 'Bloomberg, 2022',
    },
  },
  'super-bowl': {
    projectionRange: { low: 10, mid: 25, high: 50, unit: 'percent_lift' },
    shortTermImpact:
      'Search lift and brand-recall spike in the 60 days following the broadcast window.',
    longTermImpact:
      'Long-tail brand-awareness compound; downstream lift in unaided recall surveys.',
    confidence: 'medium',
    caseStudy: {
      company: 'Squarespace',
      outcome:
        'Recurring Super Bowl placements (2014-2022) lifted unaided brand awareness from 8% to 45% over the decade.',
      source: 'Squarespace S-1, 2021',
    },
  },
  'new-product': {
    projectionRange: { low: 12, mid: 28, high: 50, unit: 'percent_lift' },
    shortTermImpact:
      'Day-1 launch press, waitlist signups, and reactivation of dormant audience.',
    longTermImpact:
      'Category leadership and margin expansion via product portfolio breadth.',
    confidence: 'high',
    caseStudy: {
      company: 'Apple',
      outcome:
        'Apple Watch launched in 2015 and grew into a $40B+ wearables franchise within seven years.',
      source: 'Apple Q4 2022 earnings',
    },
  },
  'ux-redesign': {
    projectionRange: { low: 8, mid: 20, high: 35, unit: 'percent_lift' },
    shortTermImpact:
      'Conversion rate uplift and reduced support tickets within the first 60 days.',
    longTermImpact:
      'Reduced churn, improved NPS, and lower CAC payback over 6-12 months.',
    confidence: 'high',
    caseStudy: {
      company: 'Linear',
      outcome:
        'Performance-first UX redesign drove a 4x year-over-year ARR ramp from 2021 to 2023.',
      source: 'Linear blog, 2023',
    },
  },
  'long-form-video': {
    projectionRange: { low: 5, mid: 12, high: 25, unit: 'percent_lift' },
    shortTermImpact:
      'Audience growth and watch-time within the first 90 days post-launch.',
    longTermImpact:
      'Brand affinity and SEO compound; series becomes a discovery surface for cold acquisition.',
    confidence: 'medium',
    caseStudy: {
      company: 'Mailchimp',
      outcome:
        'Mailchimp Presents original video series drove 60M+ views and supported the brand premium that fed the Intuit acquisition.',
      source: 'Cannes Lions case study, 2020',
    },
  },
  'short-form-social': {
    projectionRange: { low: 8, mid: 18, high: 40, unit: 'percent_lift' },
    shortTermImpact:
      'Follower growth and viral velocity within the first 30 days; lift in earned media.',
    longTermImpact:
      'Cultural relevance moat and Gen-Z brand affinity that compounds for 12-24 months.',
    confidence: 'medium',
    caseStudy: {
      company: 'Duolingo',
      outcome:
        'Duolingo TikTok grew from 100K to 6.7M followers (2021-2023) and contributed to a $6B IPO valuation.',
      source: 'NYT, 2023',
    },
  },
};

const SECTOR_MODIFIERS: Record<Sector, number> = {
  'B2B SaaS': 1.0,
  CPG: 1.2,
  'Climate Tech': 0.9,
  Health: 1.05,
  Fintech: 0.95,
  'E-Commerce': 1.15,
  Media: 1.0,
};

export function generateStubROI(
  sector: Sector,
  actionId: ActionId,
): ROIProfile {
  const template = ACTION_TEMPLATES[actionId];
  const modifier = SECTOR_MODIFIERS[sector];
  return {
    projectionRange: {
      low: Math.round(template.projectionRange.low * modifier),
      mid: Math.round(template.projectionRange.mid * modifier),
      high: Math.round(template.projectionRange.high * modifier),
      unit: 'percent_lift',
    },
    caseStudy: template.caseStudy,
    shortTermImpact: template.shortTermImpact,
    longTermImpact: template.longTermImpact,
    confidence: template.confidence,
  };
}
