"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { aiResponse } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const models = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{ [key: string]: string | null }>(
    {}
  );
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const input = formData.get("prompt") as string;

    const apiCalls = models.map(async (model) => {
      try {
        const text = await aiResponse(input, model);
        return { model, text, error: null };
      } catch (error) {
        return {
          model,
          text: null,
          error: error instanceof Error ? error.message : "An error occured",
        };
      }
    });

    const apiResponses = await Promise.all(apiCalls);
    const newResults: { [key: string]: string | null } = {};
    const newErrors: { [key: string]: string | null } = {};
    for (const { model, text, error } of apiResponses) {
      newResults[model] = text;
      newErrors[model] = error;
    }
    setResponses(newResults);
    setErrors(newErrors);
    setLoading(false);
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OpenAi Model Comparison</h1>
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex gap-2">
          <Input
            type="text"
            name="prompt"
            placeholder="Enter your prompt here"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Compare"}
          </Button>
        </div>
      </form>

      <div className="grid grid-rows-3 gap-5">
        {models.map((model) => (
          <Card key={model} role="heading" aria-level={2}>
            <CardHeader>
              <CardTitle>{model} says:</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Generating response...</p>
              ) : errors[model] ? (
                <Alert variant="destructive" className="mb-5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errors[model]}</AlertDescription>
                </Alert>
              ) : responses[model] ? (
                <p className="whitespace-pre-wrap">{responses[model]}</p>
              ) : (
                <p className="text-gray-500">No response generated yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
