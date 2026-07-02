/**
 * Prompt builder utilities for @elizaos/plugin-image-generation.
 *
 * Each builder returns a detailed, model-optimised prompt string for a
 * specific content type. Prompts follow the visual language of Rome travel
 * agency content and are calibrated to the strengths of the routed model.
 */

// ---------------------------------------------------------------------------
// Photoreal prompts — optimised for FLUX.2 Pro
// ---------------------------------------------------------------------------

/**
 * Builds a photorealistic lifestyle prompt for destination imagery.
 *
 * @param location    - Rome landmark or area (e.g. "Colosseum", "Trastevere")
 * @param timeOfDay   - Lighting condition (e.g. "golden hour", "blue hour", "midday")
 * @param style       - Visual mood (e.g. "cinematic", "editorial", "documentary")
 * @returns Detailed prompt optimised for FLUX.2 Pro photorealism.
 */
export function buildPhotorealPrompt(
  location: string,
  timeOfDay: string,
  style: string,
): string {
  return [
    `Professional travel photography of ${location} in Rome, Italy.`,
    `Lighting: ${timeOfDay}, warm golden tones, long shadows, atmospheric haze.`,
    `Visual style: ${style}, ultra-sharp detail, shallow depth of field.`,
    "Camera: Sony A7R V with 24-70mm f/2.8 GM II lens.",
    "Post-processing: subtle film grain, lifted shadows, rich saturation.",
    "People: candid tourists and locals adding authentic life to the scene.",
    "Sky: dramatic clouds or clear blue, not blown out.",
    "Foreground interest: cobblestones, fountains, or street detail.",
    "Aspect ratio: 4:3 landscape, print-quality resolution.",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Text-heavy prompts — optimised for Ideogram 3.0
// ---------------------------------------------------------------------------

/**
 * Builds a text-in-image carousel slide prompt.
 *
 * Ideogram 3.0 is the only reliable model for legible text rendered directly
 * inside the image. Prompts must explicitly describe text placement and style.
 *
 * @param title       - Primary headline text to render in the image
 * @param items       - Bullet points or sub-items (max 5 for legibility)
 * @param colorPalette - Brand palette description (e.g. "warm terracotta and cream")
 * @returns Detailed prompt optimised for Ideogram 3.0 text rendering.
 */
export function buildTextHeavyPrompt(
  title: string,
  items: string[],
  colorPalette: string,
): string {
  const itemList = items
    .slice(0, 5)
    .map((item, i) => `${i + 1}. ${item}`)
    .join(", ");
  return [
    `Infographic carousel slide with bold readable text.`,
    `Main headline: "${title}" in large serif font, centred at top.`,
    `Body text items: ${itemList}`,
    `Color palette: ${colorPalette}, high contrast for legibility.`,
    "Background: subtle textured paper or clean gradient, not photographic.",
    "Typography: clean hierarchy, large point size, no decorative scripts.",
    "Icons: simple flat icons beside each item.",
    "Layout: 1:1 square format, generous white space, brand-consistent padding.",
    "Style: modern editorial infographic, Instagram carousel slide.",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Brand asset prompts — optimised for Imagen 4 Ultra
// ---------------------------------------------------------------------------

/**
 * Builds a premium brand asset prompt for headers, logos, and testimonials.
 *
 * Imagen 4 Ultra delivers the highest polish for marketing materials.
 *
 * @param assetType - Type of asset (e.g. "hero header", "testimonial card", "offer banner")
 * @param brand     - Brand name and tone (e.g. "Roma Luxury Tours, sophisticated and warm")
 * @returns Detailed prompt optimised for Imagen 4 Ultra polish.
 */
export function buildBrandAssetPrompt(
  assetType: string,
  brand: string,
): string {
  return [
    `Professional marketing asset: ${assetType} for ${brand}.`,
    "Aesthetic: luxury travel brand, sophisticated yet approachable.",
    "Color language: deep terracotta, aged parchment, muted gold accents.",
    "Typography space: clear area reserved at top-third for headline text overlay.",
    "Imagery: iconic Roman architecture rendered in a painterly, editorial style.",
    "Finish: ultra-clean, print-ready, no noise or compression artefacts.",
    "Composition: rule of thirds, strong visual hierarchy, premium whitespace.",
    "Format: 16:9 widescreen for headers, 4:5 portrait for testimonial cards.",
    "Mood: aspirational, timeless, trustworthy.",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// UGC prompts — optimised for Seedream 5
// ---------------------------------------------------------------------------

/**
 * Builds a user-generated-content style prompt with brand consistency.
 *
 * Seedream 5 excels at character reference continuity and 4K native output,
 * making it ideal for authentic-feeling UGC that still aligns with the brand.
 *
 * @param scenario  - UGC scenario (e.g. "solo female traveller at Trevi Fountain")
 * @param aesthetic - Visual aesthetic (e.g. "iPhone candid", "vintage film", "moody editorial")
 * @returns Detailed prompt optimised for Seedream 5 UGC output.
 */
export function buildUGCPrompt(scenario: string, aesthetic: string): string {
  return [
    `User-generated travel photo: ${scenario} in Rome, Italy.`,
    `Aesthetic: ${aesthetic}, authentic and unposed, real travel moment.`,
    "Camera feel: smartphone shot, slightly imperfect framing, true-to-life colours.",
    "Subject: traveller engaging naturally with the environment, not posing stiffly.",
    "Background: real Rome street, monument, or cafe — recognisable but not staged.",
    "Lighting: available light only, no visible flash, honest exposure.",
    "Output: 4K native resolution, suitable for Stories or feed posts.",
    "Emotion: joy, wonder, relaxation — authentic human emotion visible.",
    "Style: the kind of photo a real person would share organically.",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Story prompts — optimised for Grok Imagine
// ---------------------------------------------------------------------------

/**
 * Builds a vertical Stories-format prompt for fast ephemeral content.
 *
 * Grok Imagine's speed and Spice mode make it ideal for behind-the-scenes,
 * polls, quick tips, and time-sensitive Stories content.
 *
 * @param topic   - Story topic (e.g. "hidden rooftop bar in Trastevere")
 * @param format  - Story format (e.g. "poll overlay", "quick tip", "behind the scenes")
 * @returns Detailed prompt optimised for Grok Imagine Stories output.
 */
export function buildStoryPrompt(topic: string, format: string): string {
  return [
    `Instagram/TikTok Story graphic: ${topic}.`,
    `Format: ${format}, vertical 9:16 composition.`,
    "Layout: bold text overlay area at top and bottom thirds.",
    "Visual: vibrant, eye-catching, scroll-stopping within 1 second.",
    "Style: contemporary social media native, slightly candid energy.",
    "Colors: punchy and saturated, native Story aesthetic.",
    "Safe zones: 250px top and bottom clear of critical content for UI chrome.",
    "Background: Rome setting, slightly blurred for text legibility.",
    "Feel: urgent, exciting, shareable — made for ephemeral consumption.",
  ].join(" ");
}
