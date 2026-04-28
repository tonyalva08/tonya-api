import Anthropic from '@anthropic-ai/sdk';
import type { MarketSnapshot, Sector } from './snapshot';
import {
  generateStubROI,
  type ActionId,
  type ROIProfile,
} from './stubs';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;
const REQUEST_TIMEOUT_MS = 14000;

export const ACTION_LABELS: Record<ActionId, { label: string; description: string }> = {
  rebrand: {
    label: 'Rebrand',
    description: 'Comprehensive brand identity refresh',
  },
  'programmatic-ads': {
    label: 'Programmatic Geotargeted Ads',
    description: 'Hyper-targeted digital campaign across geographies',
  },
  'irl-campaign': {
    label: 'IRL Campaign',
    description: 'Real-world activations, OOH, and live events',
  },
  'super-bowl': {
    label: 'Super Bowl / High-Impact Placement',
    description: 'Tier-1 broadcast or premium media placement',
  },
  'new-product': {
    label: 'New Product Design',
    description: 'Net-new product line or category extension',
  },
  'ux-redesign': {
    label: 'UX/UI App Redesign',
    description: 'End-to-end product experience overhaul',
  },
  'long-form-video': {
    label: 'Long-Form Video Content',
    description: 'Episode-length video series',
  },
  'short-form-social': {
    label: 'Short-Form / Social Content',
    description: 'TikTok, Reels, and Shorts production',
  },
};

const SYSTEM_PROMPT = `You are Tonya, a design investment ROI analyst. You assess the projected return of a specific design action for a specific company in a specific sector, grounded in real, verifiable case studies.

## Your role

You answer one question per request: "If this company invests in this design action, what is the realistic ROI range, what comparable case study supports the projection, and what is the timeline of impact?"

You are evidence-based, never speculative. You name only real, verifiable companies and source citations. You never invent case studies. You never fabricate revenue numbers. If the case study evidence in your knowledge for a sector × action combination is thin, you flag it as low confidence rather than overclaim.

## Output contract

You will record your analysis using the \`record_roi_profile\` tool. Do not respond with prose. Always call the tool exactly once. Your response must include:
- \`projectionRange\`: { low, mid, high, unit: "percent_lift" } — projected revenue or growth lift as a percentage
- \`caseStudy\`: { company, outcome, source } — one real comparable example
- \`shortTermImpact\`: string — what the company should expect in 30-90 days
- \`longTermImpact\`: string — what the company should expect over 6-12+ months
- \`confidence\`: "low" | "medium" | "high"

## The 8 design actions

You analyze ROI for one of these eight design actions (the user will tell you which):

1. **Rebrand** — comprehensive brand identity refresh. Compounds over 12-18 months as positioning sharpens.
2. **Programmatic Geotargeted Ads** — hyper-targeted digital campaign. Fast feedback loop on CAC.
3. **IRL Campaign** — physical activations, OOH, events. Earned-media-driven impact.
4. **Super Bowl / High-Impact Placement** — tier-1 broadcast or premium media. High variance, high ceiling.
5. **New Product Design** — net-new product line or category extension. Long timeline, high ceiling.
6. **UX/UI App Redesign** — product experience overhaul. Conversion + retention impact.
7. **Long-Form Video Content** — episode-length video series. Audience and SEO compound.
8. **Short-Form / Social Content** — TikTok/Reels/Shorts. Cultural relevance and reach.

## Projection ranges

Express projections as percent lift on the company's primary economic engine, which varies by sector:
- B2B SaaS: ARR or self-serve signups
- CPG: revenue or velocity
- Climate Tech: pipeline or deployed-megaton
- Health: subscriber growth or LTV
- Fintech: assets-under-management or active accounts
- E-Commerce: revenue or conversion
- Media: subscribers or watch-time

Provide low / mid / high projections that bracket plausible outcomes. The mid is your best estimate; low and high reflect realistic downside and upside given the case study evidence.

## Case study selection

Pick ONE comparable case study per ROI assessment. Selection criteria, in order of importance:
1. Same sector
2. Comparable stage
3. Same design action
4. Real, named, publicly-known outcome
5. Verifiable source (TechCrunch, Adweek, S-1, earnings call, official blog post, Cannes Lions, Bloomberg, NYT)

If you cannot find a same-sector example, expand to nearest neighbor and lower confidence to medium or low.

Never invent a case study. Never fabricate revenue numbers. If you cite a number, it must be sourced.

## Confidence calibration

- **high**: you have at least one strong, sector-matched, action-matched case study with hard outcome data
- **medium**: you have a partial match (cross-sector or adjacent action) or softer outcome data
- **low**: case study coverage for this sector × action combination is genuinely thin in your knowledge; flag this honestly so the user knows to weight your projections accordingly

## Sector context

The seven sectors and their economic dynamics:

### B2B SaaS
Lift comes from improved conversion, expansion ARR, and reduced churn. UX and rebrand actions tend to compound; high-impact media is rare and rarely worth it.

### CPG
Lift comes from velocity at retail, DTC conversion, and brand premium. IRL, short-form social, and rebrand actions perform well; programmatic ads also work for the right SKUs.

### Climate Tech
Lift comes from enterprise pipeline acceleration and policy/RFP positioning. Rebrand and content actions matter more than paid media here.

### Health
Lift comes from trust-driven conversion and retention. UX redesign, long-form video, and rebrand are highest-leverage; trust-eroding actions (Super Bowl with weak follow-through) underperform.

### Fintech
Lift comes from new account acquisition and existing-customer expansion. UX and rebrand are highest-leverage; trust is the dominant variable.

### E-Commerce
Lift comes directly from CR optimization and CAC reduction. UX redesign and programmatic ads have the most measurable impact; rebrand has compounding effect on returning-customer rate.

### Media
Lift comes from subscriber growth and watch-time. Short-form social and long-form video are highest-leverage; rebrand can lift premium positioning.

## Important constraints

- Always call the \`record_roi_profile\` tool exactly once. Never produce a text-only response.
- Never invent a case study. Cite real companies and real sources.
- Never invent precise revenue figures you cannot source. If quoting a number, the source must support it.
- The case study must include a named company and a named source citation (publication, document, or platform).
- Confidence must be "low" if the case study evidence is genuinely thin — do not overclaim.`;

const ROI_TOOL: Anthropic.Tool = {
  name: 'record_roi_profile',
  description:
    'Record the structured ROI profile for the given design action and company.',
  input_schema: {
    type: 'object' as const,
    properties: {
      projectionRange: {
        type: 'object',
        properties: {
          low: { type: 'number' },
          mid: { type: 'number' },
          high: { type: 'number' },
          unit: { type: 'string', enum: ['percent_lift'] },
        },
        required: ['low', 'mid', 'high', 'unit'],
      },
      caseStudy: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          outcome: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['company', 'outcome', 'source'],
      },
      shortTermImpact: { type: 'string' },
      longTermImpact: { type: 'string' },
      confidence: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
    },
    required: [
      'projectionRange',
      'caseStudy',
      'shortTermImpact',
      'longTermImpact',
      'confidence',
    ],
  },
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export async function generateROIProfile(
  sector: Sector,
  actionId: ActionId,
  snapshot: MarketSnapshot,
): Promise<ROIProfile> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateStubROI(sector, actionId);
  }

  const action = ACTION_LABELS[actionId];
  const userMessage = `Sector: ${sector}
Design action: ${action.label} — ${action.description}

Market snapshot context:
- Stage: ${snapshot.stage}
- Positioning: ${snapshot.positioning}
- Direct competitors: ${snapshot.competitors.map((c) => c.name).join(', ')}

Analyze the projected ROI of this design action for this company in this sector, and call the record_roi_profile tool with your findings.`;

  const response = await getClient().messages.create(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [ROI_TOOL],
      tool_choice: { type: 'tool', name: 'record_roi_profile' },
      messages: [{ role: 'user', content: userMessage }],
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
  );

  if (!toolUse) {
    throw new Error('claude_no_tool_use');
  }

  // eslint-disable-next-line no-console
  console.log(
    `[roi] usage: input=${response.usage.input_tokens} cache_create=${response.usage.cache_creation_input_tokens ?? 0} cache_read=${response.usage.cache_read_input_tokens ?? 0} output=${response.usage.output_tokens}`,
  );

  return toolUse.input as ROIProfile;
}
