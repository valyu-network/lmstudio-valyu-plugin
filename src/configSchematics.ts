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
    "maxResults",
    "numeric",
    {
      displayName: "Max Search Results",
      hint: "Maximum number of search results to return: for smaller models, use 3-5, for larger models with better context windows, use 10-20 (default: 5)",
      slider: {
        min: 1,
        max: 20,
        step: 1,
      },
      int: true,
    },
    5
  )
  .field(
    "responseLength",
    "select",
    {
      displayName: "Response Length",
      hint: "Control content length: 'short' for smaller models, 'medium' for balanced output, 'long' for longer outputs, 'max' for models with high context limits. (default: short)",
      options: [
        { value: "short", displayName: "Short" },
        { value: "medium", displayName: "Medium" },
        { value: "long", displayName: "Long" },
        { value: "max", displayName: "Max" },
      ],
    },
    "short"
  )
  .field(
    "fastMode",
    "boolean",
    {
      displayName: "Fast Mode",
      hint: "Enable fast mode for faster response times but shoter, less detailed content. (default: false)",
    },
    false
  )
  .field(
    "summary",
    "boolean",
    {
      displayName: "Summary Mode",
      hint: "Get summarized responses instead of raw search results. Returns a single coherent answer rather than multiple search results. Good for smaller models which struggle with longer context. (default: false)",
    },
    false
  )
  .build();
