import { tool } from "ai";
import { z } from "zod";

export const webSearchTool = tool({
  description:
    "Search the web for recent and factual information. Use this whenever the user asks about current events, news, live information, sports, weather, or anything that may have changed recently.",

  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),

  execute: async ({ query }) => {
    console.log("🔎 WEB SEARCH TOOL CALLED:", query);
    console.log(process.env.TAVILY_API_KEY);

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        include_images: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Tavily Error:", error);
      throw new Error("Failed to perform web search.");
    }

    const data = await response.json();

    console.log("✅ Tavily Response:");
    console.dir(data, { depth: null });

    return {
      answer: data.answer,
      results:
        data.results?.map((item: any) => ({
          title: item.title,
          url: item.url,
          content: item.content,
        })) ?? [],
    };
  },
});