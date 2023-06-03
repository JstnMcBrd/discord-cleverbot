FROM node:18-slim
RUN apt update

RUN apt install git --yes

ENV NODE_ENV=development
