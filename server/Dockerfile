FROM node:20-slim AS build
WORKDIR /repo
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install
COPY shared ./shared
COPY server ./server
RUN cd server && npm run build

FROM node:20-slim
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/server/package.json /repo/server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev
COPY --from=build /repo/server/dist ./server/dist
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
