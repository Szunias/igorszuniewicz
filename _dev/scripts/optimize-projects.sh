#!/bin/bash
# Quick optimization script for project pages

PROJECT_FILES=(
  "not-today-darling.html"
  "amorak.html"
  "audiolab.html"
  "akantilado.html"
  "pause-and-deserve.html"
  "richter.html"
  "musicforgames.html"
)

for file in "${PROJECT_FILES[@]}"; do
  filepath="C:/Users/szuni/OneDrive/Pulpit/guwno/igorszuniewicz/projects/$file"

  if [ -f "$filepath" ]; then
    echo "✅ Optimizing $file"

    # Add defer to navigation.js if not present
    sed -i 's|<script src="\.\./assets/js/components/navigation\.js"></script>|<script src="../assets/js/components/navigation.js" defer></script>|g' "$filepath"

    # Add defer to translations.js if not present
    sed -i 's|<script src="\.\./assets/js/components/translations\.js"></script>|<script src="../assets/js/components/translations.js" defer></script>|g' "$filepath"

    echo "   ✓ Scripts optimized"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 All project pages optimized!"
