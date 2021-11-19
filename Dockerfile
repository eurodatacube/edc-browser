# use docker image with node to install dependencies and build the app
FROM node:14-alpine as builder

# copy the source to the folder
WORKDIR /app
COPY ./ /app

# install dependencies
# run lint before building, so it fails quicker in case of syntax errors
# build the app
RUN npm ci
RUN npm run lint
RUN npm run build

# use docker image with nginx to serve the app
FROM nginx:1.19.2-alpine

# copy build code to the nginx image's host folder
COPY --from=builder /app/build /usr/share/nginx/html

# define the path to the file with runtime environment variables
ENV runtimeEnvVarsFilePath="/usr/share/nginx/html/runtimeEnvVars.js"

# define the path where in the ngnix image should the file with environment variable names be copied to
# copy it
ENV envVarNamesFilePath="/tmp/envVarNames.json"
COPY --from=builder /app/src/utils/envVarNames.json $envVarNamesFilePath

# define the path where in the ngnix image should the script for injecting environment variables 
# from docker container into file with runtime environment variables be copied to
# copy it and make it executable
ENV setEnvVarsFilePath="/tmp/setEnvVars.sh"
COPY --from=builder /app/setEnvVars.sh $setEnvVarsFilePath
RUN chmod +x $setEnvVarsFilePath

# install packages that are needed by the script for injecting environment variables
# from docker container into file with runtime environment variables
RUN apk add --no-cache bash
RUN apk add --no-cache jq

# tell the docker what to do when the docker container is started:
# - run the script for injecting environment variable 
#     from docker container into file with runtime environment variables
# - start nginx server
WORKDIR /usr/share/nginx/html
CMD ["/bin/bash", "-c", "$setEnvVarsFilePath && nginx -g \"daemon off;\""]
