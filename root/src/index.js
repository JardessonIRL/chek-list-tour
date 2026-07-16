export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Public: read the current sheet + all check marks
    if (url.pathname === '/api/state' && request.method === 'GET') {
      const raw = await env.DATA.get('state');
      return new Response(raw || 'null', {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Replace the sheet (headers/rows/check column)
    if (url.pathname === '/api/dataset' && request.method === 'POST') {
      const body = await request.json();
      const rawExisting = await env.DATA.get('state');
      const existing = rawExisting ? JSON.parse(rawExisting) : { ticks: {} };
      const newState = {
        headers: body.headers,
        rows: body.rows,
        tickColIndex: body.tickColIndex,
        ticks: existing.ticks || {}
      };
      await env.DATA.put('state', JSON.stringify(newState));
      return new Response('ok');
    }

    // Anyone with the link can toggle a check mark
    if (url.pathname === '/api/tick' && request.method === 'POST') {
      const body = await request.json();
      const rawExisting = await env.DATA.get('state');
      const existing = rawExisting ? JSON.parse(rawExisting) : { headers: [], rows: [], tickColIndex: -1, ticks: {} };
      existing.ticks = existing.ticks || {};
      existing.ticks[body.key] = { checked: body.checked, date: body.date };
      await env.DATA.put('state', JSON.stringify(existing));
      return new Response('ok');
    }

    // Clear all check marks
    if (url.pathname === '/api/reset' && request.method === 'POST') {
      const rawExisting = await env.DATA.get('state');
      const existing = rawExisting ? JSON.parse(rawExisting) : {};
      existing.ticks = {};
      await env.DATA.put('state', JSON.stringify(existing));
      return new Response('ok');
    }

    // Everything else: serve the static site
    return env.ASSETS.fetch(request);
  }
};
