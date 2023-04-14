import buildServer from "./server";

const server = buildServer();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });

    console.log(`Server listening on ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
