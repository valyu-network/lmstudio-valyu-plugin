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

# Step 3: Check for required tools
echo ""
echo -e "${YELLOW}→ Checking dependencies...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Find LMStudio CLI
LMS_PATH=""
if command -v lms &> /dev/null; then
    LMS_PATH="lms"
elif [ -f "$HOME/.lmstudio/bin/lms" ]; then
    LMS_PATH="$HOME/.lmstudio/bin/lms"
elif [ -f "/Applications/LMStudio.app/Contents/Resources/lms" ]; then
    LMS_PATH="/Applications/LMStudio.app/Contents/Resources/lms"
else
    echo -e "${RED}❌ LMStudio CLI (lms) not found. Please ensure LMStudio is installed.${NC}"
    echo "   Expected locations:"
    echo "   - $HOME/.lmstudio/bin/lms"
    echo "   - /Applications/LMStudio.app/Contents/Resources/lms"
    exit 1
fi

echo -e "${GREEN}✓ Found LMStudio CLI at: $LMS_PATH${NC}"

# Step 4: Install dependencies
echo -e "${YELLOW}→ Installing dependencies...${NC}"
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    echo "Running npm install with verbose output:"
    npm install
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 5: Install TypeScript if not available
if ! npm list typescript &> /dev/null && ! command -v tsc &> /dev/null; then
    echo -e "${YELLOW}→ Installing TypeScript...${NC}"
    npm install --save-dev typescript > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install TypeScript${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ TypeScript installed${NC}"
fi

# Step 6: Build TypeScript
echo -e "${YELLOW}→ Building plugin...${NC}"
npx tsc > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo "Running TypeScript compilation with verbose output:"
    npx tsc
    exit 1
fi
echo -e "${GREEN}✓ Plugin built successfully${NC}"

# Step 7: Copy to LMStudio
PLUGIN_DIR="$HOME/.lmstudio/extensions/plugins/lmstudio/valyu"

# Remove old installation if exists
if [ -d "$PLUGIN_DIR" ]; then
    echo -e "${YELLOW}→ Removing old plugin installation...${NC}"
    rm -rf "$PLUGIN_DIR"
fi

echo -e "${YELLOW}→ Installing plugin to LMStudio...${NC}"
mkdir -p "$(dirname "$PLUGIN_DIR")"

# Copy files excluding node_modules and dist directories to avoid conflicts
if command -v rsync &> /dev/null; then
    rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' . "$PLUGIN_DIR" > /dev/null 2>&1
else
    # Fallback: copy everything then remove problematic directories
    cp -r . "$PLUGIN_DIR"
    rm -rf "$PLUGIN_DIR/node_modules" "$PLUGIN_DIR/dist" "$PLUGIN_DIR/.git"
fi

# Step 8: Build in LMStudio directory
cd "$PLUGIN_DIR"
echo -e "${YELLOW}→ Finalizing installation...${NC}"
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies in plugin directory${NC}"
    exit 1
fi

npx tsc > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build plugin in installation directory${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Plugin installed to LMStudio${NC}"

# Step 9: Create a run script
RUN_SCRIPT="$HOME/.lmstudio/run-valyu-plugin.sh"
cat > "$RUN_SCRIPT" << EOF
#!/bin/bash
cd ~/.lmstudio/extensions/plugins/lmstudio/valyu
"$LMS_PATH" dev
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
    "$LMS_PATH" dev
fi