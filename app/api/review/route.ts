import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Extend Vercel function timeout to 60s (default is 10s on hobby plan)
export const maxDuration = 60;

// ─── Rate limiting ────────────────────────────────────────────────────────────
// In-memory store: works per-instance (good enough for Vercel hobby plan).
// 10 requests per IP per 60 seconds.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ipTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (ipTimestamps.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  ipTimestamps.set(ip, timestamps);
  return false;
}

// ─── Input validation ─────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// 4 MB expressed as base64 character count (~4/3 overhead)
const MAX_BASE64_CHARS = Math.ceil((4 * 1024 * 1024 * 4) / 3);

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert in UX design and mobile/web accessibility. Analyze the provided UI screenshot and generate two outputs following these exact rules:

GENERAL RULES:
- All output must be in English
- Do not quote WCAG guideline references (e.g. do not write "WCAG 1.3.3")
- Do not split information about the same element across multiple points — consolidate into a single point
- Flag any typos found in the UI copy directly in the UI UPDATE list
- If the image contains both an AS IS and a TO BE state: write all specs (UI Update and Screen Reader) exclusively for the TO BE state. Use the AS IS only as reference to understand what changed and produce more accurate specs. Do not produce specs for the AS IS state.

OUTPUT 1 — UI UPDATE:
A numbered list of imperative instructions written for a developer. Cover all relevant issues found across these categories:
- Contrast: text and UI components must have sufficient contrast; do not rely on color alone to convey state
- Touch targets: minimum 24×24px required, 44×44px recommended; apply to all interactive elements
- Labels: icon-only buttons must have visible text labels; replace generic or mouse-centric labels
- Decorative elements: must be marked aria-hidden="true"
- State communication: toggle/expand/lock states must be conveyed programmatically; required fields must use the required attribute; invalid fields must use aria-invalid="true"
- Focus management: all interactive elements must have a visible focus indicator; focus must move on screen/overlay appear and return on dismiss
- Live regions: loading, success/error, and dynamic changes must use aria-live; polite for non-critical, assertive for urgent
- Auto-hiding elements: timers must pause when focus is inside
- Custom gestures: must have accessible keyboard/switch alternatives
- Forms: associate helper text and errors via aria-describedby; disable confirm button when required fields are empty
- Scrollable lists: announce scrollability; fixed CTAs must remain reachable

OUTPUT 2 — SCREEN READER NAVIGATION:
A structured navigation order with expected screen reader announcements. Divide into sections based on screen layout.

Respond ONLY with a valid JSON object, no markdown, no backticks, no additional text. Use this exact structure:

{
  "ui_update": [
    "1 - [imperative instruction]",
    "2 - [imperative instruction]"
  ],
  "screen_reader": [
    {
      "section": "Section name",
      "items": [
        {
          "index": 0,
          "element": "Element name",
          "announcement": "Expected announcement, role, state",
          "states": ["when state X: announcement"],
          "live": ["↳ on action (live region) announcement"]
        }
      ]
    }
  ]
}

Rules for screen reader items:
- Numbering starts at 0 (page title) and is continuous across all sections
- Decorative elements: announcement = "aria-hidden=true — decorative, screen reader skips it"
- states array: only populate when the element has multiple states (toggle on/off, expanded/collapsed, locked/unlocked)
- live array: only populate when the element triggers live region announcements
- Keep states and live as empty arrays [] when not applicable`;

export async function POST(request: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  try {
    const { imageBase64, mediaType, model } = await request.json();

    // ── Input validation ────────────────────────────────────────────────────
    if (!imageBase64 || !mediaType) {
      return NextResponse.json(
        { error: "Image missing." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(mediaType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PNG, JPG, WebP, or GIF." },
        { status: 415 }
      );
    }

    if (typeof imageBase64 !== "string" || imageBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json(
        { error: "File too large. Please upload an image under 4 MB." },
        { status: 413 }
      );
    }

    // ── Model selection (server-side whitelist) ─────────────────────────────
    const ALLOWED_MODELS = ["claude-sonnet-4-5", "claude-haiku-4-5-20251001"];
    const selectedModel = ALLOWED_MODELS.includes(model) ? model : "claude-sonnet-4-5";

    const response = await client.messages.create({
      model: selectedModel,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Analyze this UI screenshot and generate the accessibility review following your instructions.",
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    let analysis;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response.");
      analysis = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("JSON parse failed. Raw response:", text);
      throw new Error("Invalid JSON response from Claude.");
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
