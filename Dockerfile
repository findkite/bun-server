FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
EXPOSE 4000
# CMD ["bun", "run", "src/index.ts"]
# This runs migrations then starts the server
CMD ["sh", "-c", "bun drizzle-kit push && bun run src/index.ts"]