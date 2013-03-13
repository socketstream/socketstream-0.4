#!/bin/sh

for file in *

do
  if [ -d "$file" ]; then
    cd "$file";
    sudo npm link;
    cd ..;
    continue
  fi
done

exit 0
