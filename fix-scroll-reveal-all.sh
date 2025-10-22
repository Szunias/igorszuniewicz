#!/bin/bash

for file in projects/*.html; do
  # Skip backup files
  if [[ "$file" == *"backup"* ]] || [[ "$file" == *".bak"* ]]; then
    continue
  fi
  
  # Check if file has scroll reveal script
  if grep -q "Scroll Reveal Animation Script" "$file"; then
    echo "Fixing: $file"
    
    # Add checkInitialVisibility function using perl for better multiline handling
    perl -i -pe '
      if (/rows\.forEach\(row => observer\.observe\(row\)\);/) {
        $_ = "      // Immediately show elements that are already in viewport\n" .
             "      const checkInitialVisibility = (element) => {\n" .
             "        const rect = element.getBoundingClientRect();\n" .
             "        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;\n" .
             "        if (isVisible) {\n" .
             "          element.classList.add(\"visible\");\n" .
             "        }\n" .
             "      };\n" .
             "      \n" .
             "      rows.forEach(row => {\n" .
             "        checkInitialVisibility(row);\n" .
             "        observer.observe(row);\n" .
             "      });\n";
      }
      s/if \(stats\) observer\.observe\(stats\);/if (stats) {\n        checkInitialVisibility(stats);\n        observer.observe(stats);\n      }/;
      s/if \(gallery\) observer\.observe\(gallery\);/if (gallery) {\n        checkInitialVisibility(gallery);\n        observer.observe(gallery);\n      }/;
    ' "$file"
    
    echo "✅ Fixed: $file"
  fi
done
