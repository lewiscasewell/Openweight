FROM node:18-alpine AS builder

# Install only essential dependencies
RUN apk update && apk add --no-cache bash openssl

WORKDIR /server
COPY server/package.json server/yarn.lock ./
RUN yarn install
COPY server .
RUN yarn build

# If node-prune is necessary, include it, otherwise skip to the final stage
# FROM softonic/node-prune:latest AS pruner
# ... node-prune steps ...

# Final Image
FROM node:18-alpine
RUN apk update && apk add --no-cache bash openssl
WORKDIR /server
COPY --from=builder /server ./

CMD ["yarn", "start:prod"]