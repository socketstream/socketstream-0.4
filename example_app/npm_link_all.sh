#!/bin/sh

for file in ../mods/*

do
  if [ -d "$file" ]; then
    IN="$file"
    set -- "$IN" 
    IFS="/"; declare -a Array=($*) 
    echo "${Array[2]}" 
    sudo npm link "${Array[2]}";
    continue
  fi
done

exit 0
