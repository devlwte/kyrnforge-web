export async function onRequest(context) {
  return new Response(JSON.stringify({
    healthy: true,
    engine: "KyrnForge Serverless Runtime",
    time: Date.now()
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
