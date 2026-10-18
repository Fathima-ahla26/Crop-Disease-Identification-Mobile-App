import 'dotenv/config';
import { z } from 'zod';

// GROQ ERROR HANDLING

function upstreamError(message, status, detail) {
  const error = new Error(message);

  error.code = "GROQ_UPSTREAM_ERROR";
  error.upstreamStatus = status;

  console.error("[Groq]", {
    status,
    detail: String(detail || "").slice(0, 1000),
  });

  return error;
}

// GROQ VISION PLANT DISEASE SCREENING

async function assessLeaf(a) {
  const key = process.env.GROQ_API_KEY?.trim();

  const model = process.env.GROQ_MODEL?.trim() || "qwen/qwen3.6-27b";

  if (!key) {
    const err = new Error(
      "AI is not configured. Set GROQ_API_KEY in backend/.env and restart the API.",
    );
    err.status = 503;
    throw err;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    let response;

    try {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,

          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            model,
            max_completion_tokens: 900,
            temperature: 0.2,
            response_format: { type: "json_object" },

            messages: [
              {
                role: "system",

                content:
                  "You are an agricultural photo-screening assistant, not a certified diagnostician. Return ONLY JSON with keys crop, disease, confidence, symptoms, recommendations, treatment, instructions. crop is the likely crop name supported by the photo, or Unspecified if it cannot be identified. Do not simply repeat an uncertain crop hint. disease is a possible disease name or Uncertain; confidence is a number from 0 to 1 or null and is only an uncalibrated AI estimate; symptoms and recommendations are arrays of short strings. treatment is a short plain-language string of cautious management suggestions for an officer to review. instructions is a separate short plain-language string with practical farmer monitoring, prevention and follow-up steps. If the condition is uncertain, both strings must acknowledge this and focus on assessment and low-risk care rather than disease-specific treatment. Do not invent what is not visible. If unsure use Uncertain and null. Never prescribe pesticide dosages.",
              },

              {
                role: "user",

                content: [
                  {
                    type: "text",

                    text: `Examine this plant or leaf photo. Identify the likely crop if possible. The optional crop hint is: ${a.crop}. Inspect only visible symptoms, provide a possible disease name (or Uncertain) and cautious, practical steps. Respond strictly as JSON.`,
                  },

                  {
                    type: "image_url",

                    image_url: {
                      url: `data:${a.mimeType};base64,${a.imageBase64}`,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );
    } catch (e) {
      if (e?.name === "AbortError") {
        throw upstreamError(
          "Groq request timed out",
          504,
          "Timeout after 45 seconds",
        );
      }

      throw upstreamError("Groq network request failed", 502, e?.message);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "Unable to read response");

      throw upstreamError("Groq returned an error", response.status, body);
    }

    const data = await response.json();

    const raw = data?.choices?.[0]?.message?.content;

    const content =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? raw
              .filter((x) => x?.type === "text")
              .map((x) => x.text)
              .join("\n")
          : "";

    const matched = content.match(/\{[\s\S]*\}/);

    if (!matched) {
      throw upstreamError(
        "Groq did not return JSON",
        502,
        "Missing JSON object in response",
      );
    }

    let result;

    try {
      result = JSON.parse(matched[0]);

      result = z
        .object({
          crop: z.string().trim().min(2).max(70).optional().default('Unspecified'),
          disease: z.string().min(1).max(160),
          confidence: z.number().min(0).max(1).nullable(),
          symptoms: z.array(z.string()).max(8),
          recommendations: z.array(z.string()).max(8),
          treatment: z.string().trim().min(5).max(4000),
          instructions: z.string().trim().min(5).max(4000),
        })
        .parse(result);
    } catch (e) {
      throw upstreamError(
        "Groq returned an invalid analysis format",
        502,
        e?.message,
      );
    }

    return {
      ...result,
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export { assessLeaf };
