const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export type UploadResult = {
  ok: boolean;
  url?: string;
  error?: string;
};

/**
 * Upload a file to cloud storage via presigned URL.
 *
 * 1. Initiates upload → gets presigned URL + public URL
 * 2. PUTs file directly to presigned URL
 * 3. Returns the public URL on success
 */
export async function uploadFile(
  file: File,
  bucket: string = "cdn",
): Promise<UploadResult> {
  const token = getToken();
  if (!token) return { ok: false, error: "Not authenticated" };

  /* Step 1: Initiate — get presigned URL */
  const initRes = await fetch(
    `${BASE_URL}/api/cloud/upload/singlepart/requests/initiate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_name: file.name, bucket }),
    },
  );

  if (initRes.status === 401) return { ok: false, error: "Session expired" };
  if (!initRes.ok) return { ok: false, error: "Failed to initiate upload" };

  const { presigned_url, public_url } = await initRes.json();

  /* Step 2: PUT the file directly to cloud storage */
  const putRes = await fetch(presigned_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) return { ok: false, error: "Failed to upload file" };

  return { ok: true, url: public_url };
}
