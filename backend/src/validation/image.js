import { z } from 'zod';

const imageSchema = z.object({
  crop: z.string().trim().min(2).max(70).optional().default("Unspecified"),
  imageBase64: z.string().min(100).max(8500000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export { imageSchema };
