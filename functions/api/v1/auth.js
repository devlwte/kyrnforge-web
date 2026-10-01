export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { apiKey, clientApp } = body;

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing API Key parameter."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Demo/Initial Gateway Validation
    return new Response(JSON.stringify({
      success: true,
      authenticated: true,
      app: clientApp || "GenericClient",
      sessionToken: "kf_live_" + Math.random().toString(36).substring(2, 15),
      expiresInSeconds: 86400,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
