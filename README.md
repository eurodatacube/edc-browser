# EDC Browser

## Development

* copy `.env.example` file and rename the copied file to `.env`, fill out the needed values
* Run `npm install`
* Run `npm start` to run the application locally
* Run `npm run prettier` to prettify `js`, `json`, `css` and `scss` files
* Run `npm run lint` to lint `js`, `json`, `css` and `scss` files
* Run `npm run build` to build the application sources

## Publishing on EDC Marketplace

Documentation for publishing an app on EDC Markerplace is available [here](https://eurodatacube.com/documentation/app-contributions).

Requirements for publishing:
- code must be in a public Github repository
- the repository must contain `Dockerfile` for building and running a Docker image

If both requirements are met, EDC will automatically build a docker image and publish it on [EDC Docker hub account](https://hub.docker.com/u/eurodatacube) and list in on EDC Marketplace.

EDC Browser is built and the build files are put into the Docker image. This ensures that EDC Browser can be used instantly after the Docker container with the Docker image is started.

### `Dockerfile`

`Dockerfile` is a Docker equivalent to `package.json` - it tells Docker how to create (build) a Docker image, which can be run anywhere.

#### Environment variables

React apps usually have environment variables baked into the code on build process (when `npm run build` is executed). 
To protect private keys that are passed as environment variables, no environment variables should be set when Docker image is built. 
So we must provide an option to use the environment variables provided when the Docker image is run in the Docker container. 
This is done by running a script in `setEnvVars.sh` which reads all the environment variables (in a Docker container) and puts them in a file `runtimeEnvVars.js`.
This file is included in `index.html` after the `npm run build` process is done (the code for including the `runtimeEnvVars.js` file in `index.html` is in `/public/index.html` because `index.js` is generated from `/public/index.html` during npm build process).

Sources:
- https://create-react-app.dev/docs/adding-custom-environment-variables/
- https://create-react-app.dev/docs/title-and-meta-tags/#injecting-data-from-the-server-into-the-page
- https://www.freecodecamp.org/news/how-to-implement-runtime-environment-variables-with-create-react-app-docker-and-nginx-7f9d42a91d70/

#### Building a Docker image from `Dockerfile`

Build a Docker image by running `docker build .` (the dot (`.`) meaning "this folder")

If the command is executed successfully, the last printed line contains the `id` of the Docker image that it created. It should look something like `Successfully built af0217257961`. 
This `id` is needed to run the image locally. 

#### Running Docker image locally

Docker images run in Docker containers.    
Environment variables need to be set on runtime (when a Docker container is started).

- run docker container providing env. vars one by one:     
  `docker run -p 8000:80 -e VAR=value {docker image id}`

- run docker container passing a file with runtime env. vars **(*)**:    
  `docker run -p 8000:80 --env-file "route/to/file" {docker image id}`

Add `-d` flag to run the docker container detached (in the background). 

**NOTE (*): The runtime environment variables names for SH and geoDB credentials are different than the ones in `.env` file, so passing the same `.env` file to the Docker container won't work.**    
The names are taken from [EDC documentation](https://eurodatacube.com/documentation/credentials-on-edc).

| buildtime env name <br /> (used in `npm run build` / `npm run start`) | runtime env name <br /> (used in `docker run ...`) |
| --- | --- |
| `REACT_APP_GEO_DB_CLIENT_ID` | `GEODB_AUTH_CLIENT_ID` |
| `REACT_APP_GEO_DB_CLIENT_SECRET` | `GEODB_AUTH_CLIENT_SECRET` |
| `REACT_APP_SH_CLIENT_ID` | `SH_CLIENT_ID` |
| `REACT_APP_SH_CLIENT_SECRET` | `SH_CLIENT_SECRET` |

#### Accessing the app running in a Docker container

Open web browser and go to `localhost:8000`.

#### Useful Docker commands

**Docker containers**
- list containers: `docker container ls` / `docker ps` / `docker ps -a`
- remove container(s): `docker rm {1 / more container ids}` / `docker container rm {1 / more container ids}`
- remove all containers: `docker rm -f $(docker ps -a -q)`
- display container info: `docker container inspect`
- start container(s): `docker container start {container id}`
- stop container(s): `docker container stop {container id}`

**Docker images**
- list images: `docker image ls`
- remove image(s): `docker rmi {1 / more image ids}` / `docker image rm {1 / more image ids}`
- remove all images: `docker rmi -f $(docker image ls -q)`

#### Problems

The Docker image is based on Linux, so there might be problems with building or running it on Windows.
- Linux containers will need to be enabled / switched to in the Docker settings ([docs](https://docs.docker.com/desktop/windows/#switch-between-windows-and-linux-containers))
- There might be problems with line endings on Windows. To fix it, follow instructions [here](https://forums.docker.com/t/error-while-running-docker-code-in-powershell/34059/6).