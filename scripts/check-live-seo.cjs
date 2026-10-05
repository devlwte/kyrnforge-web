async function testLive() {
  const res = await fetch('https://kyrnforge.dev', { headers: { 'Cache-Control': 'no-cache' } });
  const html = await res.text();

  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const descMatch = html.match(/<meta name="description" content="(.*?)"/);
  const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
  const ogDescMatch = html.match(/<meta property="og:description" content="(.*?)"/);

  console.log('--- LIVE SEO VERIFICATION ---');
  console.log('Title       :', titleMatch ? titleMatch[1] : 'N/A');
  console.log('Description :', descMatch ? descMatch[1] : 'N/A');
  console.log('OG:Title    :', ogTitleMatch ? ogTitleMatch[1] : 'N/A');
  console.log('OG:Desc     :', ogDescMatch ? ogDescMatch[1] : 'N/A');
}

testLive().catch(console.error);
