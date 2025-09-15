#!/bin/bash

# Valyu LMStudio Plugin - Automated Setup Script
# This script handles the complete installation process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo "   Valyu Plugin for LMStudio Setup   "
echo "======================================"
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "manifest.json" ] || [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the valyu plugin directory${NC}"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Step 2: Check for API key
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Found existing .env file${NC}"
    read -p "Do you want to keep the existing API key? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        rm .env
        echo -e "${YELLOW}→ Removed existing .env file${NC}"
    fi
fi

if [ ! -f ".env" ]; then
    echo ""
    echo "Please enter your Valyu API key"
    echo "(Get one at https://platform.valyu.network/)"
    echo ""
    read -p "API Key: " api_key

    if [ -z "$api_key" ]; then
        echo -e "${RED}❌ API key cannot be empty${NC}"
        exit 1
    fi

    echo "VALYU_API_KEY=$api_key" > .env
    echo -e "${GREEN}✓ Created .env file with API key${NC}"
fi

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}→ Installing dependencies...${NC}"
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Build TypeScript
echo -e "${YELLOW}→ Building plugin...${NC}"
npx tsc > /dev/null 2>&1
echo -e "${GREEN}✓ Plugin built successfully${NC}"

# Step 5: Copy to LMStudio
PLUGIN_DIR="$HOME/.lmstudio/extensions/plugins/lmstudio/valyu"

# Remove old installation if exists
if [ -d "$PLUGIN_DIR" ]; then
    echo -e "${YELLOW}→ Removing old plugin installation...${NC}"
    rm -rf "$PLUGIN_DIR"
fi

echo -e "${YELLOW}→ Installing plugin to LMStudio...${NC}"
mkdir -p "$(dirname "$PLUGIN_DIR")"
cp -r . "$PLUGIN_DIR"

# Step 6: Build in LMStudio directory
cd "$PLUGIN_DIR"
echo -e "${YELLOW}→ Finalizing installation...${NC}"
npm install > /dev/null 2>&1
npx tsc > /dev/null 2>&1
echo -e "${GREEN}✓ Plugin installed to LMStudio${NC}"

# Step 7: Create a run script
RUN_SCRIPT="$HOME/.lmstudio/run-valyu-plugin.sh"
cat > "$RUN_SCRIPT" << 'EOF'
#!/bin/bash
cd ~/.lmstudio/extensions/plugins/lmstudio/valyu
lms dev
EOF
chmod +x "$RUN_SCRIPT"

echo ""
echo "======================================"
echo -e "${GREEN}    ✅ Installation Complete!${NC}"
echo "======================================"
echo ""
echo "To use the plugin:"
echo ""
echo "1. Start the plugin server (REQUIRED):"
echo -e "   ${YELLOW}~/.lmstudio/run-valyu-plugin.sh${NC}"
echo "   (Keep this running in a terminal)"
echo ""
echo "2. Open LMStudio"
echo ""
echo "3. Go to Integrations (⚡ icon)"
echo ""
echo "4. Toggle 'valyu' plugin ON"
echo ""
echo "5. Test with:"
echo "   'Use valyu_deepsearch to search for AI news'"
echo ""
echo "======================================"
echo ""
read -p "Start the plugin server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Starting plugin server...${NC}"
    echo "Press Ctrl+C to stop the server"
    echo ""
    cd "$PLUGIN_DIR"
    lms dev
fi