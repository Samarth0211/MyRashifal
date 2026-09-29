const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

function getConfig() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.INSTAGRAM_USER_ID;
  if (!token || !accountId) {
    throw new Error('Instagram credentials not configured');
  }
  return { token, accountId };
}

/**
 * Step 1: Create a media container with image URL and caption.
 * Image must be a publicly accessible HTTPS URL.
 */
export async function createMediaContainer(imageUrl, caption) {
  const { token, accountId } = getConfig();
  const response = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: token,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(`IG Media Error: ${data.error.message}`);
  return data.id;
}

/**
 * Step 2: Publish the media container.
 */
export async function publishMedia(creationId) {
  const { token, accountId } = getConfig();
  const response = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: token,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(`IG Publish Error: ${data.error.message}`);
  return data.id;
}

/**
 * Create + publish in one call.
 * Includes 5-second delay for Instagram image processing.
 */
export async function postToInstagram(imageUrl, caption) {
  const creationId = await createMediaContainer(imageUrl, caption);
  await new Promise(resolve => setTimeout(resolve, 5000));
  const mediaId = await publishMedia(creationId);
  return { creationId, mediaId };
}

/**
 * Exchange short-lived token for long-lived (60 days).
 */
export async function exchangeForLongLivedToken(shortLivedToken) {
  const response = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${process.env.FACEBOOK_APP_ID}&` +
    `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
    `fb_exchange_token=${shortLivedToken}`
  );
  const data = await response.json();
  if (data.error) throw new Error(`Token Exchange Error: ${data.error.message}`);
  return data;
}

/**
 * Refresh a long-lived token before it expires.
 */
export async function refreshLongLivedToken() {
  const { token } = getConfig();
  const response = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${process.env.FACEBOOK_APP_ID}&` +
    `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
    `fb_exchange_token=${token}`
  );
  const data = await response.json();
  if (data.error) throw new Error(`Token Refresh Error: ${data.error.message}`);
  return data;
}
