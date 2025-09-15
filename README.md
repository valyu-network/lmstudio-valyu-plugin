# Valyu Plugin for LMStudio

A powerful LMStudio plugin that integrates Valyu's DeepSearch and Contents API, giving your local LLMs access to the web, and more.

## 🌟 What is This?

This plugin extends [LMStudio](https://lmstudio.ai/) - a desktop application for running Large Language Models locally - with advanced search capabilities powered by [Valyu's API](https://valyu.network/). It enables your local AI models to search the web, access academic papers, retrieve financial data, and extract content from any webpage.

## ✨ Features

### DeepSearch API (`valyu_deepsearch`)
- 🔍 Search across web, academic papers, financial data, and more
- 📊 Real-time content retrieval with relevance scoring
- 📚 Support for proprietary and open-access content
- 🖼️ Multi-modal content (text, images, tables)
- ⚙️ Configurable search parameters

### Contents API (`valyu_contents`)
- 📄 Extract full content from web pages
- 📝 Retrieve metadata (author, date, description)
- 🧹 Clean, structured content extraction
- 📏 Adjustable response length

## 🚀 Quick Installation (What Actually Works!)

The key to getting the Valyu plugin working in LMStudio is to **copy it directly to the extensions folder**.

### Prerequisites

- [LMStudio](https://lmstudio.ai/) installed on your machine
- Node.js (comes with LMStudio)
- A Valyu API key from [platform.valyu.network](https://platform.valyu.network/)

### Step 1: Prepare the Plugin

1. **Clone this repository**:
   ```bash
   git clone [repository-url]
   cd valyu
   ```

2. **Set up your API key** in a `.env` file in the parent directory:
   ```bash
   # Create .env in the lmstudio folder (parent of valyu)
   echo "VALYU_API_KEY=your_api_key_here" > ../.env
   ```

3. **Install dependencies and build**:
   ```bash
   npm install
   npx tsc
   ```

### Step 2: Install in LMStudio

**This is the crucial step:**

```bash
# Copy the plugin directly to LMStudio's extensions folder
cp -r . ~/.lmstudio/extensions/plugins/lmstudio/valyu
```

### Step 3: Activate in LMStudio

1. **Open LMStudio** (no restart needed!)
2. Navigate to **Integrations** (⚡ icon)
3. Find **"valyu"** in the plugins list
4. **Toggle it ON** using the switch
5. The plugin is now active!

## 📝 How to Use

Once enabled, your LLM can use two powerful tools:

### DeepSearch Examples

```
Search for recent developments in quantum computing using valyu_deepsearch
```

```
Use valyu_deepsearch with search_type="proprietary" to find academic papers about machine learning
```

```
Find information about Apple's latest earnings using valyu_deepsearch
```

### Contents Extraction Examples

```
Use valyu_contents to extract the full article from https://techcrunch.com/[article-url]
```

```
Get the content from this URL using valyu_contents: [paste any URL]
```

## 🔧 Development Mode

For active development with hot-reload:

1. Navigate to the plugin directory:
   ```bash
   cd /path/to/valyu
   ```

2. Start development mode:
   ```bash
   lms dev
   # or
   npm run dev
   ```

3. Make your changes - they'll auto-reload
4. Copy to LMStudio's folder when done:
   ```bash
   cp -r . ~/.lmstudio/extensions/plugins/lmstudio/valyu
   ```

## 📁 Project Structure

```
valyu/
├── .env.example          # Example environment variables
├── README.md            # This file
├── TESTING.md           # Detailed testing guide
├── manifest.json        # Plugin metadata
├── package.json         # Node dependencies
├── tsconfig.json        # TypeScript configuration
├── src/
│   ├── index.ts         # Plugin entry point
│   ├── configSchematics.ts  # Configuration schema
│   └── toolsProvider.ts     # Valyu API integration
└── dist/                # Compiled JavaScript (auto-generated)
```

## ⚙️ Configuration

### Environment Variables (`.env` file)
```bash
VALYU_API_KEY=your_api_key_here
```

### Plugin Settings in LMStudio
- **API Key**: Your Valyu authentication key
- **Base URL**: API endpoint (default: https://api.valyu.network)
- **Max Results**: Maximum search results (default: 10)
- **Relevance Threshold**: Minimum relevance score (0.0-1.0, default: 0.5)

## 🎯 Pro Tips

1. **API Key Setup**: The plugin automatically reads from the `.env` file in the parent directory
2. **No Beta Access Needed**: Direct copy method bypasses plugin beta requirements
3. **Hot Reload**: Use `lms dev` during development for instant updates
4. **Chain Operations**: Models can chain searches and content extraction for comprehensive research

## 🔍 Example Workflow

```
User: "Research the latest developments in AI safety and give me detailed information"

Assistant uses:
1. valyu_deepsearch("AI safety developments 2025")
2. Gets list of relevant URLs
3. valyu_contents(["url1", "url2", "url3"])
4. Analyzes full content and provides comprehensive answer
```

## 🐛 Troubleshooting

### Plugin Not Showing?
- Ensure it's copied to: `~/.lmstudio/extensions/plugins/lmstudio/valyu`
- Check the Integrations panel
- No restart required after copying!

### API Errors?
- Verify your API key is correct
- Check credits at [platform.valyu.network](https://platform.valyu.network)
- Test API directly:
  ```bash
  curl -X POST https://api.valyu.network/v1/deepsearch \
    -H "x-api-key: YOUR_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query": "test", "search_type": "web"}'
  ```

### Tools Not Working?
- Ensure plugin toggle is ON
- Try: "Use valyu_deepsearch to search for 'test'"
- Verify model supports tool calling

## 📊 API Limits & Pricing

- **Free Tier**: 1000+ queries included
- **No Credit Card**: Required to start
- **Monitor Usage**: Check at [platform.valyu.network](https://platform.valyu.network)
- **Pay-per-use**: For additional usage beyond free tier

## 🎉 Success Checklist

✅ Plugin appears in Integrations list
✅ Toggle switch is available and ON
✅ Model responds to valyu_deepsearch requests
✅ Model can extract content with valyu_contents
✅ No errors in responses

## 💡 Quick Test

After setup, try this in chat:
```
Use valyu_deepsearch to find information about "artificial intelligence news today"
```

If you get search results back, everything is working!

## 🔗 Resources

- **LMStudio**: [lmstudio.ai](https://lmstudio.ai/)
- **Valyu Platform**: [platform.valyu.network](https://platform.valyu.network/)
- **Valyu Documentation**: [docs.valyu.network](https://docs.valyu.network/)
- **Support**: File issues in this repository

## 📜 License

ISC

---

**Version:** 1.0.0
**Created by:** Valyu Plugin Development Team
**Powered by:** [Valyu API](https://valyu.network/) & [LMStudio](https://lmstudio.ai/)