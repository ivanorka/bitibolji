import { getArticle, getEnglishArticle } from "@/lib/articles";
import {
  getArticleAudioChunks,
  getArticleAudioVersion,
  getElevenLabsVoiceId,
  getElevenLabsVoiceSettings,
  isElevenLabsAudioReady,
  type AudioVoiceProfile,
} from "@/lib/article-audio";

type RouteContext = { params: Promise<{ locale: string; slug: string }> };

const netlifyVary = "query=voice|part|meta|v";

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Netlify-Vary": netlifyVary,
    },
  });
}

export async function GET(request: Request, { params }: RouteContext) {
  const { locale, slug } = await params;
  if (locale !== "hr" && locale !== "en") return jsonResponse({ error: "Unsupported language." }, 400);

  const url = new URL(request.url);
  const profile = url.searchParams.get("voice") as AudioVoiceProfile | null;
  if (profile !== "vlado") return jsonResponse({ error: "Unsupported voice." }, 400);

  const article = locale === "en" ? getEnglishArticle(slug) : getArticle(slug);
  if (!article) return jsonResponse({ error: "Article not found." }, 404);

  const chunks = getArticleAudioChunks(article, locale);
  const version = getArticleAudioVersion(article, locale);
  if (url.searchParams.get("meta") === "1") {
    return jsonResponse({
      provider: "elevenlabs",
      model: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
      ready: isElevenLabsAudioReady(),
      parts: chunks.length,
      version,
    });
  }

  if (url.searchParams.get("v") !== version) {
    return jsonResponse({ error: "Article audio version is stale." }, 409);
  }

  if (!isElevenLabsAudioReady()) {
    return jsonResponse({ error: "ElevenLabs audio is not configured." }, 503);
  }

  const part = Number.parseInt(url.searchParams.get("part") ?? "0", 10);
  if (!Number.isInteger(part) || part < 0 || part >= chunks.length) {
    return jsonResponse({ error: "Audio part not found." }, 404);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = getElevenLabsVoiceId();
  if (!apiKey || !voiceId) return jsonResponse({ error: "ElevenLabs audio is not configured." }, 503);

  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  const endpoint = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`);
  endpoint.searchParams.set("output_format", "mp3_44100_128");

  const upstream = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: chunks[part],
      model_id: modelId,
      previous_text: part > 0 ? chunks[part - 1].slice(-700) : undefined,
      next_text: part + 1 < chunks.length ? chunks[part + 1].slice(0, 700) : undefined,
      voice_settings: getElevenLabsVoiceSettings(profile),
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const details = await upstream.text().catch(() => "");
    console.error("ElevenLabs audio generation failed", upstream.status, details.slice(0, 500));
    return jsonResponse({ error: "Audio generation failed. Please try again." }, 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Disposition": `inline; filename="${slug}-${profile}-${part + 1}.mp3"`,
      "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
      "Netlify-CDN-Cache-Control": "public, durable, max-age=31536000",
      "Netlify-Vary": netlifyVary,
      "X-Audio-Part": String(part + 1),
      "X-Audio-Parts": String(chunks.length),
      "X-Audio-Provider": "elevenlabs",
    },
  });
}
