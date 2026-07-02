/**
 * Video and voiceover prompt builder utilities for @elizaos/plugin-video-generation.
 *
 * Each builder function is tuned to the characteristics and strengths of the
 * model that will receive the prompt:
 *   buildHeroPrompt     → Veo 3.1     (cinematic, dramatic, native audio)
 *   buildStandardPrompt → Kling 3.0   (POV, casual, trend-aligned)
 *   buildProductPrompt  → Runway Gen-4.5 (camera-controlled, showcase)
 *   buildStoryPrompt    → Luma Ray    (quick, mood-driven, vertical)
 *   buildVoiceoverScript → ElevenLabs  (timed, accent-matched)
 */

// ---------------------------------------------------------------------------
// Video prompts
// ---------------------------------------------------------------------------

/**
 * Builds a cinematic prompt for Veo 3.1 hero reels.
 *
 * Structures the prompt around dramatic camera movement, emotional
 * atmosphere, and high production value — all traits that maximise the
 * premium $1.60/8s tier.
 */
export function buildHeroPrompt(scene: string): string {
  return [
    `Cinematic hero reel: ${scene}.`,
    "Ultra-wide establishing shot transitioning to intimate close-up.",
    "Golden hour lighting, warm Italian tones, dramatic lens flare.",
    "Slow dolly-in movement with subtle parallax depth.",
    "Emotional, aspirational atmosphere evoking Roman grandeur.",
    "4K HDR, film grain, anamorphic bokeh.",
    "Native ambient audio: distant church bells, cobblestone echoes, gentle breeze.",
  ].join(" ");
}

/**
 * Builds a casual POV prompt for Kling 3.0 Pro standard reels.
 *
 * Designed for high-volume social content — authentic, energetic, and
 * trend-aligned to maximise engagement on Reels and TikTok.
 */
export function buildStandardPrompt(scenario: string): string {
  return [
    `POV travel reel: ${scenario}.`,
    "First-person perspective walking through Rome.",
    "Handheld camera movement, natural lighting, authentic street feel.",
    "Vibrant colours, spontaneous moments, locals in background.",
    "Dynamic cuts every 2–3 seconds for Reels pacing.",
    "Upbeat energy matching trending travel content.",
  ].join(" ");
}

/**
 * Builds a camera-controlled showcase prompt for Runway Gen-4.5 product tours.
 *
 * Runway's camera-control API makes it ideal for precise tracking shots
 * around properties, amenities, and experiences.
 */
export function buildProductPrompt(product: string, angle: string): string {
  return [
    `Product showcase reel: ${product}.`,
    `Camera movement: ${angle}.`,
    "Smooth orbital camera move revealing all angles of the subject.",
    "Clean, bright, aspirational lighting — luxury hospitality aesthetic.",
    "Depth of field pulling focus to hero details: texture, space, quality.",
    "No people — pure subject focus for property and experience showcases.",
    "Crisp 4K, colour-graded for warmth and sophistication.",
  ].join(" ");
}

/**
 * Builds a mood-driven short prompt for Luma Ray 3.14 Stories content.
 *
 * Luma Ray delivers fast 3-second clips at minimal cost — best used for
 * mood pieces, vertical Stories fills, and quick social cuts.
 */
export function buildStoryPrompt(mood: string): string {
  return [
    `Vertical Stories clip: ${mood} mood in Rome.`,
    "9:16 aspect ratio, optimised for mobile Stories playback.",
    "3-second punchy clip — instant atmosphere, no slow build.",
    "Saturated, editorial colour grade matching the mood.",
    "Single strong visual: one subject, one moment, one feeling.",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Voiceover script builder
// ---------------------------------------------------------------------------

/**
 * Builds a timed voiceover script for ElevenLabs synthesis.
 *
 * Structures copy for Italian-accented English delivery:
 * short sentences, natural pauses, emotive language that suits
 * a warm Mediterranean vocal style.
 *
 * @param topic   - Subject of the voiceover (e.g. "the Colosseum at dusk")
 * @param tone    - Desired tone: "inspirational" | "informative" | "promotional"
 * @param duration - Target audio duration in seconds (used to calibrate word count)
 */
export function buildVoiceoverScript(
  topic: string,
  tone: "inspirational" | "informative" | "promotional",
  duration: number,
): string {
  // Approximate 130 words per minute for a measured, accented delivery.
  const targetWords = Math.round((duration / 60) * 130);

  const openers: Record<
    "inspirational" | "informative" | "promotional",
    string
  > = {
    inspirational: `Close your eyes. Imagine ${topic}.`,
    informative: `Let me tell you about ${topic}.`,
    promotional: `Experience ${topic} like never before.`,
  };

  const bodies: Record<
    "inspirational" | "informative" | "promotional",
    string
  > = {
    inspirational: [
      "The light falls differently here.",
      "Every stone carries a story.",
      "This is Rome — eternal, beautiful, yours.",
    ].join(" "),
    informative: [
      "Rich in history, layered with culture.",
      "Each corner reveals something extraordinary.",
      "Come prepared. Leave transformed.",
    ].join(" "),
    promotional: [
      "Our exclusive experience puts you at the heart of it.",
      "Private access. Local expertise. Unforgettable moments.",
      "Book your place — limited availability.",
    ].join(" "),
  };

  const closers: Record<
    "inspirational" | "informative" | "promotional",
    string
  > = {
    inspirational: "Rome is waiting for you.",
    informative: "Discover more with us.",
    promotional: "Link in bio. Your Rome story starts today.",
  };

  const script = [openers[tone], bodies[tone], closers[tone]].join(" ");

  // Pad or trim to approximate the target word count.
  const words = script.split(/\s+/);
  if (words.length > targetWords) {
    return `${words.slice(0, targetWords).join(" ")}.`;
  }

  return script;
}
