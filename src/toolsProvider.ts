import { text, tool, ToolsProviderController } from "@lmstudio/sdk";
import { z } from "zod";
import { configSchematics } from "./configSchematics";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from parent directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface DeepSearchResult {
  title: string;
  url: string;
  snippet: string;
  relevance_score?: number;
  author?: string;
  published_date?: string;
  source?: string;
}

interface ContentsResult {
  url: string;
  title: string;
  content: string;
  metadata?: {
    author?: string;
    published_date?: string;
    description?: string;
  };
}

export async function toolsProvider(ctl: ToolsProviderController) {
  const config = ctl.getPluginConfig(configSchematics);

  // Get API key from config or environment
  const apiKey = config.get("valyuApiKey") || process.env.VALYU_API_KEY;

  const deepSearchTool = tool({
    name: "valyu_deepsearch",
    description: text`
      Search across web, academic papers, and financial data using Valyu's DeepSearch API.
      Returns comprehensive search results with full-text content, citations, and metadata.

      Use this tool when you need:
      - Academic research and papers
      - Real-time web content
      - Financial data and reports
      - Fact-checking and verification
      - Multi-modal content (text, images, tables)

      The search supports various parameters to customize results:
      - query: Your search query
      - search_type: "web" (default), "proprietary", or "all"
      - max_results: Number of results to return
      - included_sources: Specific sources to search (optional)

      IMPORTANT: Only use valyu_contents when:
      - You need the FULL content of a specific URL that was found in search results
      - The user explicitly provides a URL and asks for its content
      - You need more detail than what's provided in the search snippet

      Do NOT suggest using valyu_contents unless actually needed.
    `,
    parameters: {
      query: z.string().describe("The search query"),
      max_results: z.number().optional().describe("Maximum number of results to return (default: 10)"),
    },
    implementation: async ({ query, max_results }, { warn }) => {
      if (!apiKey) {
        return "Error: Valyu API key not configured. Please set it in plugin settings.";
      }

      try {
        const url = new URL(`${config.get("valyuBaseUrl")}/v1/deepsearch`);

        const requestBody: any = {
          query,
          max_num_results: max_results || config.get("maxResults"),
          response_length: "max"
        };

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          warn(`Valyu API error: ${response.status} - ${errorText}`);
          return `Error: Failed to search. Status: ${response.status}`;
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
          return {
            message: "No results found for your query.",
            suggestion: "Try different search terms or broaden your search type to 'all'."
          };
        }

        const results: DeepSearchResult[] = data.results.map((result: any) => {
          // Log to see what fields the API actually returns
          console.log('Valyu API result fields:', Object.keys(result));
          console.log('Snippet length from API:', result.snippet?.length);
          console.log('Content length from API:', result.content?.length);
          console.log('Text length from API:', result.text?.length);

          // Use ALL available content fields without ANY truncation
          const content = result.content || result.text || result.snippet || result.description || result.full_text || result.body || "";

          // If the API itself truncated (ends with ...), note that
          if (content.endsWith('...')) {
            console.log('Note: Content was already truncated by Valyu API');
          }

          return {
            title: result.title || "Untitled",
            url: result.url || "",
            snippet: content,  // NO TRUNCATION - show everything the API returns
            relevance_score: result.relevance_score,
            author: result.author,
            published_date: result.published_date,
            source: result.source,
          };
        });

        return {
          results,
          total_results: data.total_results || results.length,
          hint: text`
            Found ${results.length} results. The snippets above contain the search results.
          `,
        };
      } catch (error: any) {
        warn(`Error calling Valyu API: ${error.message}`);
        return `Error: Failed to perform search - ${error.message}`;
      }
    },
  });

  const contentsTool = tool({
    name: "valyu_contents",
    description: text`
      Extract and retrieve full content from web pages using Valyu's Contents API.
      This tool fetches the complete text content, metadata, and structured information from URLs.

      Use this tool when you need the COMPLETE full text of a specific webpage,
      for example if a user provides a URL, or if you know the URL of a webpage that will be used in the conversation.

      Features:
      - Full text extraction
      - Metadata extraction (author, date, description)
      - Clean, structured content
      - Support for various content types
    `,
    parameters: {
      urls: z.array(z.string()).describe("Array of URLs to extract content from"),
    },
    implementation: async ({ urls }, { warn }) => {
      if (!apiKey) {
        return "Error: Valyu API key not configured. Please set it in plugin settings.";
      }

      if (urls.length === 0) {
        return "Error: Please provide at least one URL to extract content from.";
      }

      try {
        const url = new URL(`${config.get("valyuBaseUrl")}/contents`);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            urls,
            response_length: "max"
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          warn(`Valyu Contents API error: ${response.status} - ${errorText}`);
          return `Error: Failed to extract content. Status: ${response.status}`;
        }

        const data = await response.json();

        if (!data.contents || data.contents.length === 0) {
          return {
            message: "No content could be extracted from the provided URLs.",
            suggestion: "Check if the URLs are valid and accessible."
          };
        }

        const contents: ContentsResult[] = data.contents.map((item: any) => ({
          url: item.url,
          title: item.title || "Untitled",
          content: item.content || "",
          metadata: {
            author: item.author,
            published_date: item.published_date,
            description: item.description,
          },
        }));

        return {
          contents,
          extracted_count: contents.length,
          total_requested: urls.length,
        };
      } catch (error: any) {
        warn(`Error calling Valyu Contents API: ${error.message}`);
        return `Error: Failed to extract content - ${error.message}`;
      }
    },
  });

  return [deepSearchTool, contentsTool];
}