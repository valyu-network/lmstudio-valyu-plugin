import { createConfigSchematics } from "@lmstudio/sdk";

export const configSchematics = createConfigSchematics()
  .field(
    "valyuApiKey",
    "string",
    {
      displayName: "Valyu API Key",
      hint: "Your Valyu API key for accessing DeepSearch and Contents API. Get one at platform.valyu.network",
    },
    process.env.VALYU_API_KEY || ""
  )
  .field(
    "valyuBaseUrl",
    "string",
    {
      displayName: "Valyu API Base URL",
      hint: "The base URL for the Valyu API.",
    },
    "https://api.valyu.network"
  )
  .field(
    "maxResults",
    "numeric",
    {
      displayName: "Max Search Results",
      hint: "Maximum number of search results to return (default: 10)",
    },
    10
  )
  .field(
    "relevanceThreshold",
    "numeric",
    {
      displayName: "Relevance Threshold",
      hint: "Minimum relevance score for results (0.0-1.0)",
    },
    0.5
  )
  .field(
    "fastMode",
    "boolean",
    {
      displayName: "Fast Mode",
      hint: "Enable fast mode for optimized search performance and faster response times but smaller content.",
    },
    false
  )
  .field(
    "responseLength",
    "string",
    {
      displayName: "Response Length",
      hint: "Control content length: 'short' for smaller models, 'medium' for balanced output, 'max' for larger models with high context limits",
    },
    "medium"
  )
  .build();
