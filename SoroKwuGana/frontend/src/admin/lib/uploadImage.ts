/**
 * uploadImage — uploads a file to the backend (/api/upload).
 * The backend stores the image in MongoDB GridFS and returns a URL.
 * That URL is what gets saved in the post — no external service needed.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG, WebP, GIF) are supported.');
  }

  const MAX_MB = 20;
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${MAX_MB} MB.`);
  }

  const token = localStorage.getItem('admin_token');
  if (!token) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const form = new FormData();
  form.append('image', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      const json = await res.json();
      if (json.message) msg = json.message;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  const json = await res.json();

  if (!json.url) {
    throw new Error('Upload succeeded but no URL was returned.');
  }

  return json.url as string;
}
