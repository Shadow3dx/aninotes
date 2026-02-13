import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});
