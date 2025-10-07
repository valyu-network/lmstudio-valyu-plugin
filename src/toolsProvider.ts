import { text, tool, ToolsProviderController } from "@lmstudio/sdk";
import { z } from "zod";
import { configSchematics } from "./configSchematics";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from the plugin root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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

interface AnswerRequest {
  query: string;
  system_instructions?: string;
  structured_output?: object;
  search_type?: "all" | "web" | "proprietary";
  fast_mode?: boolean;
  data_max_price?: number;
  included_sources?: string[];
  excluded_sources?: string[];
  start_date?: string;
  end_date?: string;
  country_code?: string;
}

interface AnswerResponse {
  success: boolean;
  ai_tx_id: string;
  original_query: string;
  contents: string | object;
  data_type: "unstructured" | "structured";
  search_results: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
    date: string;
    length: number;
  }>;
  search_metadata: {
    tx_ids: string[];
    number_of_results: number;
    total_characters: number;
  };
  ai_usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cost: {
    total_deduction_dollars: number;
    search_deduction_dollars: number;
    ai_deduction_dollars: number;
  };
}

export async function toolsProvider(ctl: ToolsProviderController) {
  const config = ctl.getPluginConfig(configSchematics);

  // Get API key from config or environment
  const apiKey = config.get("valyuApiKey") || process.env.VALYU_API_KEY;
  const baseUrl = process.env.VALYU_BASE_URL || "https://api.valyu.network";

  const deepSearchTool = tool({
    name: "valyu_deepsearch",
    description: text`
      Search across web, academic papers, and financial data using Valyu's DeepSearch API to get the most relevant and up to date information.
      Returns comprehensive search results with full-text content, citations, and metadata.
      When Summary Mode is enabled in settings, returns an AI-generated summary instead of raw search results.
    `,
    parameters: {
      query: z.string().describe("The search query"),
    },
    implementation: async ({ query }, { warn }) => {
      if (!apiKey) {
        return "Error: Valyu API key not configured. Please set it in plugin settings.";
      }

      try {
        // Check if summary mode is enabled
        const summaryMode = config.get("summary");

        if (summaryMode) {
          // Use Answer API for summary mode
          const url = new URL(`${baseUrl}/v1/answer`);

          const requestBody: AnswerRequest = {
            query,
            fast_mode: config.get("fastMode"),
            search_type: "all",
            data_max_price: 100,
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
            warn(`Valyu Answer API error: ${response.status} - ${errorText}`);
            return `Error: Failed to generate summary. Status: ${response.status}`;
          }

          const data: AnswerResponse = await response.json();

          if (!data.success) {
            return `Error: Failed to generate summary`;
          }

          // Return the AI-generated summary with metadata
          return {
            summary: data.contents,
            hint: text`
              Generated AI summary based on ${data.search_results.length} sources. 
            `,
          };
        } else {
          // Use existing DeepSearch API for detailed results
          const url = new URL(`${baseUrl}/v1/deepsearch`);

          const responseLength = config.get("responseLength");
          let responseLengthValue = 1000;
          if (responseLength === "short") {
            responseLengthValue = 1000;
          } else if (responseLength === "medium") {
            responseLengthValue = 2500;
          } else if (responseLength === "long") {
            responseLengthValue = 10000;
          } else if (responseLength === "max") {
            responseLengthValue = 100000;
          }

          const requestBody: any = {
            query,
            max_num_results: config.get("maxResults"),
            response_length: responseLengthValue,
            fast_mode: config.get("fastMode"),
            max_price: 100,
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
              suggestion: "Try different search terms",
            };
          }

          const results: DeepSearchResult[] = data.results.map(
            (result: any) => {
              // Handle content - it might be a string or an object (for financial data)
              let content = "";

              if (result.content !== undefined && result.content !== null) {
                if (typeof result.content === "string") {
                  content = result.content;
                } else if (typeof result.content === "object") {
                  // For financial data or structured content, convert to JSON string
                  content = JSON.stringify(result.content, null, 2);
                } else {
                  // Handle primitive values like numbers for financial data (e.g., 22.4)
                  content = String(result.content);
                }
              } else {
                // Fallback to other fields if content is not available
                content =
                  result.text ||
                  result.snippet ||
                  result.description ||
                  result.full_text ||
                  result.body ||
                  "";
              }

              // Only check for truncation if content is a string
              if (typeof content === "string" && content.endsWith("...")) {
                // Content was truncated by Valyu API
              }

              return {
                title: result.title || "Untitled",
                url: result.url || "",
                snippet: content, // Will be string (either original or JSON stringified)
                relevance_score: result.relevance_score,
                author: result.author,
                published_date: result.publication_date,
                source: result.source,
                doi: result.doi,
                citation: result.citation,
              };
            }
          );

          return {
            results,
            total_results: data.total_results || results.length,
            hint: text`
              Found ${results.length} results. The snippets above contain the search results.
            `,
          };
        }
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

    `,
    parameters: {
      urls: z
        .array(z.string())
        .describe("Array of URLs to extract content from"),
    },
    implementation: async ({ urls }, { warn }) => {
      if (!apiKey) {
        return "Error: Valyu API key not configured. Please set it in plugin settings.";
      }

      if (urls.length === 0) {
        return "Error: Please provide at least one URL to extract content from.";
      }

      try {
        const url = new URL(`${baseUrl}/v1/contents`);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            urls,
            response_length: config.get("responseLength"),
            extract_effort: "auto",
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          warn(`Valyu Contents API error: ${response.status} - ${errorText}`);
          return `Error: Failed to extract content. Status: ${response.status}`;
        }

        const data = await response.json();

        // Handle both old and new API response formats
        const resultsArray = data.results || data.contents;

        if (!resultsArray || resultsArray.length === 0) {
          return {
            message: "No content could be extracted from the provided URLs.",
            suggestion: "Check if the URLs are valid and accessible.",
          };
        }

        const contents: ContentsResult[] = resultsArray.map((item: any) => ({
          url: item.url,
          title: item.title || "Untitled",
          content: item.content || item.text || item.body || "",
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
