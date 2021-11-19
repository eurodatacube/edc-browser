#!/bin/bash

# Recreate config file
rm -rf $runtimeEnvVarsFilePath
touch $runtimeEnvVarsFilePath

# Add assignment
echo "window._env_ = {" >> $runtimeEnvVarsFilePath

# save an array of needed environment variables from envVarNames.json to variable
envVarNames=( $(jq -r '.[].runTimeName' $envVarNamesFilePath) )

# Read each line from printenv (https://man7.org/linux/man-pages/man1/printenv.1.html)
# Each line represents key=value pairs
printenv | while read -r line || [[ -n "$line" ]]; do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}
  # if value is already wrapped in quotation marks (""), don't wrap it again
  [[ $value = \"* ]] && cleanValue=$value || cleanValue=\"$value\"

  # if variable name is in the array of needed variables, add it to JS file
  if [[ " ${envVarNames[*]} " =~ " ${varname} " ]]; then
    # Append configuration property to JS file
    echo "  $varname: $cleanValue," >> $runtimeEnvVarsFilePath
  fi
  
done

echo "}" >> $runtimeEnvVarsFilePath
