// app/api/heygen-token/route.ts
//a
export async function GET() {
  const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
    method: "POST",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("HeyGen token fetch error:", errorText);
    return new Response(JSON.stringify({ error: errorText }), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify({ token: data.data.token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

const fetchAccessToken = async (): Promise<string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
  const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
    method: "POST",
    headers: { "x-api-key": apiKey! },
  });
  const { data } = await response.json();
  console.log("HeyGen token (direct):", data.token);
  return data.token;
};
