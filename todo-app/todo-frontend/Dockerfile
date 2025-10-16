FROM node:20 AS base

WORKDIR /usr/src/app

COPY . .

RUN npm ci

FROM base AS test
RUN npm test

FROM base AS build

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

FROM nginx:1.25-alpine

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

