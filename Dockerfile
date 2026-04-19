FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
EXPOSE 4000
CMD ["bun", "run", "src/index.ts"]