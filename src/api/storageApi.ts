import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { GalleryItem, GalleryMediaType, IdentityDocument, IdentityDocumentType, UploadedAsset } from "@/types";

const ID_DOCUMENT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const GALLERY_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"];
const ID_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
const GALLERY_MAX_BYTES = 50 * 1024 * 1024;

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

function assertFile(file: File, allowedTypes: string[], maxBytes: number, label: string) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`${label} must be a JPG, PNG, WebP${allowedTypes.includes("application/pdf") ? ", or PDF" : ", MP4, WebM, or MOV"}.`);
  }
  if (file.size > maxBytes) {
    throw new Error(`${label} must be smaller than ${Math.round(maxBytes / 1024 / 1024)}MB.`);
  }
}

async function uploadAsset(file: File, path: string): Promise<UploadedAsset> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return {
    url: await getDownloadURL(storageRef),
    storagePath: path,
    name: file.name,
    contentType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function uploadIdentityDocument(file: File, ownerKey: string, type: IdentityDocumentType): Promise<IdentityDocument> {
  assertFile(file, ID_DOCUMENT_TYPES, ID_DOCUMENT_MAX_BYTES, "Identity document");
  const asset = await uploadAsset(file, `provider-verification/${ownerKey}/identity-${Date.now()}-${safeName(file.name)}`);
  return { ...asset, type };
}

export async function uploadGalleryItem(file: File, userId: string): Promise<GalleryItem> {
  assertFile(file, GALLERY_TYPES, GALLERY_MAX_BYTES, "Reference work");
  const type: GalleryMediaType = file.type.startsWith("video/") ? "video" : "image";
  const asset = await uploadAsset(file, `provider-gallery/${userId}/${Date.now()}-${safeName(file.name)}`);
  return {
    id: `gallery_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...asset,
    type,
  };
}

export async function deleteStoredAsset(storagePath: string) {
  await deleteObject(ref(storage, storagePath));
}
