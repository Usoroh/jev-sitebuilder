import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { TypeSafeClient, type SystemOneRequest } from "@typesafe-ai/sdk";

/**
 * Dev-only proxy for Jev. The browser posts a systemOne request here so the
 * API key never leaves the machine.
 */
export default function jev(): Plugin {
  let client: TypeSafeClient | undefined;

  return {
    name: "jev-api",
    config(_, { mode }) {
      const apiKey = loadEnv(mode, process.cwd(), "").TYPESAFE_API_KEY;
      if (apiKey) client = new TypeSafeClient({ apiKey });
      else console.warn("[jev] TYPESAFE_API_KEY not set — the builder falls back to local keyword matching.");
    },
    configureServer(server) {
      server.middlewares.use("/api/jev", async (req, res) => {
        res.setHeader("content-type", "application/json");
        if (!client) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: "no-api-key" }));
          return;
        }
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = JSON.parse(Buffer.concat(chunks).toString()) as SystemOneRequest;
          const started = Date.now();
          const { data, requestId } = await client.systemOne(body).withResponse();
          // Printed so a session's cost and speed can be watched from here,
          // without waiting for a console to aggregate it.
          console.log(
            `[jev] ${data.model} ${Date.now() - started}ms ` +
              `in=${data.usage.input_tokens} out=${data.usage.output_tokens}` +
              (requestId ? ` id=${requestId}` : ""),
          );
          res.end(JSON.stringify(data));
        } catch (error) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}
