FROM node:22-alpine AS builder
WORKDIR /app
COPY polylens-ui/server/package.json polylens-ui/server/package-lock.json /app/
RUN npm ci
COPY polylens-ui/server/ /app/
RUN node scripts/prod-build.js

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/
COPY polylens-ui/server/prisma /app/prisma
EXPOSE 3001
CMD ["node", "dist/index.js"]
