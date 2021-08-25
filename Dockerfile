FROM node:14-alpine as builder

WORKDIR /app
COPY ./ /app

# install dependencies
# run lint before building, so it fails quicker in case of syntax errors
# build the app
RUN npm ci
RUN npm run lint
RUN npm run build

FROM nginx:1.19.2-alpine

# copy build code to the nginx host folder
COPY --from=builder /app/build /usr/share/nginx/html

# copy script for injecting docker container environment variables into code on runtime
# and make it executable
WORKDIR /usr/share/nginx/html
COPY ./setEnvVars.sh .
RUN chmod +x setEnvVars.sh

# tell the docker what to do when the docker container is started:
# - run the script for injecting docker container environment variables into code
# - start nginx server
RUN apk add --no-cache bash
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/setEnvVars.sh && nginx -g \"daemon off;\""]
