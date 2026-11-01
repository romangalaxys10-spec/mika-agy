#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_APP="$SCRIPT_DIR/build/Mika.app"
DEST_APP="/Applications/Mika.app"

if [ ! -d "$SOURCE_APP" ]; then
    echo "❌ Build not found! Running build_app.sh first..."
    "$SCRIPT_DIR/build_app.sh"
fi

echo "🐱 Installing Mika.app to /Applications..."
rm -rf "$DEST_APP"
cp -R "$SOURCE_APP" "$DEST_APP"
echo "🎉 Mika.app installed successfully to /Applications/Mika.app!"
echo "🚀 You can launch it from Spotlight, Launchpad, or by running: open /Applications/Mika.app"
