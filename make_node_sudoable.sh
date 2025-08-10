#!/usr/bin/env bash

# Check if NVM_DIR is set and non-empty
if [ -z "$NVM_DIR" ]; then
    echo "Error: NVM_DIR is not set or empty. MUST USE sudo -E ."
    exit 1
fi

# Check if nvm is available
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
else
    echo "Error: nvm command not found. MUST USE sudo -E."
    exit 1
fi

# Check if nvm version can be retrieved
if [ -z "$(nvm version)" ]; then
    echo "Error: Unable to retrieve nvm version. MUST USE sudo -E."
    exit 1
fi

sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npx" "/usr/local/bin/npx"
