import buildServer from "./server";

(async () => {
  const server = buildServer();
  try {
    await server.ready();
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`Server listening on 3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
