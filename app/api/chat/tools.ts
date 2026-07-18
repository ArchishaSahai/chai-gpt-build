import { tool } from "ai";
import { z } from "zod";

export const webSearchTool = tool({
  description:
    "Search the web for up-to-date information when needed.",

  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),

  execute: async ({ query }) => {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error("Web search failed");
    }

    const data = await response.json();

    return data;
  },
});