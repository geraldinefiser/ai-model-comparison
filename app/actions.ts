"use server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
export const aiResponse = async (prompt: string, model: string) => {
  const result = await generateText({
    model: openai(model),
    prompt: prompt,
  });
  return result.text;
};
