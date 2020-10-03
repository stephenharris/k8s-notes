
FROM node:alpine
ARG VERSION='v1'
RUN echo $VERSION > /app_version
COPY server.js /server.js
ENTRYPOINT ["node", "server.js"]