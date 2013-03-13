#!/bin/sh

for file in ../mods/*

do
  if [ -d "$file" ]; then
    MODULE=`basename $file`
    sudo npm link $MODULE
    continue
  fi
done

exit 0