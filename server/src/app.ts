import buildServer from "./server";

const PORT = process.env.PORT || 3000;

(async () => {
  const server = await buildServer();
  try {
    await server.ready();
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`Server listening on ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
