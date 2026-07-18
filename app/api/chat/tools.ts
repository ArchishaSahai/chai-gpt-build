import { tool } from "ai";
import { z } from "zod";

export const webSearchTool = tool({
  description:
    "Search the web for recent and factual information. Use this whenever the user asks about current events, news, live information, sports, weather, or anything that may have changed recently.",

  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),

  execute: async ({ query }) => {
  console.log("WEB SEARCH TOOL CALLED:", query);

  try {
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
        include_images: false,
        max_results: 3,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    return {
      answer: data.answer,
      results:
        data.results?.map((item: any) => ({
          title: item.title,
          url: item.url,
          content: item.content,
        })) ?? [],
    };
  } catch (error) {
    console.error("Web Search Error:", error);

    return {
      error:
        "Web search is temporarily unavailable. Please answer using your existing knowledge.",
    };
  }
},
});