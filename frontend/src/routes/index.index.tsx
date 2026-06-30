import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/index/")({
  server: {
    handlers: {
      GET: () => new Response(null, { status: 302, headers: { Location: "/" } }),
    },
  },
});
