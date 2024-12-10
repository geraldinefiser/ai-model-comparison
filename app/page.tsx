"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

import { aiResponse } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const models = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const input = formData.get("prompt") as string;
    try {
      const results = await Promise.all(
        models.map(async (model) => {
          const text = await aiResponse(input, model);
          return { model, text };
        })
      );
      const newResults: { [key: string]: string } = {};

      for (const { model, text } of results) {
        newResults[model] = text;
      }
      setResponses(newResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResponses({});
    } finally {
      setLoading(false);
    }
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

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-rows-3 gap-5">
        {models.map((model) => (
          <Card key={model} role="heading" aria-level={2}>
            <CardHeader>
              <CardTitle>{model} says:</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Generating response...</p>
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
