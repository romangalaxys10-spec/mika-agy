#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_NAME="Mika"
BUILD_DIR="$SCRIPT_DIR/build"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"

echo "🐱 ========================================="
echo "🐾 Building Native macOS App: $APP_NAME.app"
echo "🐱 ========================================="

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

# 1. Compile Swift sources
echo "🔨 Compiling Swift sources..."
swiftc -O \
    -target arm64-apple-macosx12.0 \
    -framework Cocoa \
    -framework WebKit \
    -framework UserNotifications \
    "$SCRIPT_DIR/src/MikaBridge.swift" \
    "$SCRIPT_DIR/src/NotificationHelper.swift" \
    "$SCRIPT_DIR/src/DoctorWindow.swift" \
    "$SCRIPT_DIR/src/QuickTaskWindow.swift" \
    "$SCRIPT_DIR/src/MainWindowController.swift" \
    "$SCRIPT_DIR/src/MenuBarController.swift" \
    "$SCRIPT_DIR/src/AppDelegate.swift" \
    "$SCRIPT_DIR/src/main.swift" \
    -o "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

chmod +x "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

# 2. Copy Plist & Icon
echo "🎨 Packaging resources & icon..."
cp "$SCRIPT_DIR/resources/Info.plist" "$APP_BUNDLE/Contents/Info.plist"
cp "$SCRIPT_DIR/resources/AppIcon.icns" "$APP_BUNDLE/Contents/Resources/AppIcon.icns"

# 3. Bundle Python Mika CLI, Desk Web Assets & Agent Server
echo "📦 Bundling Mika core scripts, desk web UI & Agent Server..."
mkdir -p "$APP_BUNDLE/Contents/Resources/mika-core"
cp -R "$PROJECT_ROOT/tools/mika/"* "$APP_BUNDLE/Contents/Resources/mika-core/"
cp "$PROJECT_ROOT/agent-server/mika_agent_server.py" "$APP_BUNDLE/Contents/Resources/mika-core/mika_agent_server.py"
cp "$PROJECT_ROOT/agent-server/georgia_presentation_builder.py" "$APP_BUNDLE/Contents/Resources/mika-core/georgia_presentation_builder.py"
cp "$PROJECT_ROOT/agent-server/mika_employee_suite.py" "$APP_BUNDLE/Contents/Resources/mika-core/mika_employee_suite.py"
cp "$PROJECT_ROOT/agent-server/mika_mcp_engine.py" "$APP_BUNDLE/Contents/Resources/mika-core/mika_mcp_engine.py"
cp "$PROJECT_ROOT/agent-server/mika_long_horizon.py" "$APP_BUNDLE/Contents/Resources/mika-core/mika_long_horizon.py"
cp "$PROJECT_ROOT/agent-server/mac_action" "$APP_BUNDLE/Contents/Resources/mika-core/mac_action"
chmod +x "$APP_BUNDLE/Contents/Resources/mika-core/mika_agent_server.py" "$APP_BUNDLE/Contents/Resources/mika-core/mac_action"

# 4. Ad-hoc Codesign
echo "🔏 Signing application bundle..."
codesign --force --deep --sign - "$APP_BUNDLE"

# 5. Create Distribution Zip
echo "🎁 Creating distribution archive..."
cd "$BUILD_DIR"
zip -r -q "$APP_NAME-mac-arm64.zip" "$APP_NAME.app"

echo "✅ ========================================="
echo "🎉 Build completed successfully!"
echo "📂 App bundle: $APP_BUNDLE"
echo "📦 Archive: $BUILD_DIR/$APP_NAME-mac-arm64.zip"
echo "✅ ========================================="
