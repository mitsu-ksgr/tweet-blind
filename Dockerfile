FROM node:22-bullseye-slim

RUN npm install -g npm@8.12.1

WORKDIR /app

COPY package*.json ./
RUN yarn install

#USER node
CMD ["/bin/bash"]

