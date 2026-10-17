import "dotenv/config";

const key = process.env.GROQ_API_KEY?.trim();
if (!key) {
  console.error("GROQ_API_KEY is missing from backend/.env");
  process.exit(1);
}
try {
  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok) {
    console.error("Groq authentication:", response.status, result.error?.message);
    process.exitCode = 1;
  } else {
    const models = result.data.map((model) => model.id);
    console.log("Groq authentication: OK");
    console.log("Configured model:", process.env.GROQ_MODEL);
    console.log("Model available:", models.includes(process.env.GROQ_MODEL));
  }
} catch (error) {
  console.error("Groq connection failed:", error.message, error.cause?.code || "");
  process.exitCode = 1;
}
