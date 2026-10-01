export async function onRequest(context) {
  const { request } = context;

  const data = {
    status: "operational",
    service: "KyrnForge Core API",
    version: "1.0.0",
    gateway: "Cloudflare Edge Serverless",
    node: request.cf?.colo || "EDGE-NODE",
    city: request.cf?.city || "Unknown",
    country: request.cf?.country || "Global",
    timestamp: new Date().toISOString(),
    uptime: "99.99%",
    modules: {
      auth: "active",
      telemetry: "active",
      kpmRegistry: "active"
    }
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=30"
    }
  });
}
