#!/bin/bash

# Find all files in the current directory and its subdirectories
# find src/. -type f |
# while read file; do
#     echo "$file"
#     # Search for lines that match the regular expression
#     find src -type f -exec sed -i '/your-regular-expression/s/old-string/new-string/g' {} \;
#     if grep -r "/@Managed/" "$file"; then
#         echo "Match found"
#         # Modify the matching lines using sed
#         sed -i 's/@Managed()//g' "$file"
#     fi
# done

find src -type f -exec sed 's/@Managed()/neki/g' {} \;
