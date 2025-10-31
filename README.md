<div align="center">
  <img src="assets/lmstudioXvalyu.png" alt="LM Studio x Valyu" width="100%"/>
</div>

# Valyu Web Access Plugin for LM Studio

An LM Studio plugin that lets your local assistant search the live web and pull full webpage content using Valyu's API.

## Installation

The plugin is available for download on the LM Studio Hub

- Click the "Run in LM Studio" button
- Create a free key at [platform.valyu.ai](https://platform.valyu.ai/) and update the key in the plugin settings.

## How to Use

With the plugin enabled, ask your assistant to:

- "Use `valyu_deepsearch` to find the latest earnings news for Apple."
- "Use `valyu_contents` to fetch the full article from https://example.com."

## Recommended Models

The following model families have been tested and work well with tool calling:

- **Qwen**
- **Gemma**
- **Granite**

## Known Issues

- **gpt-oss and smaller LLMs**: These models are known to have issues with tool calling or processing search results, causing them to call search tools in a loop repeatedly despite being given the right context. If you encounter this issue, we recommend using larger or more capable models.

## License

ISC
