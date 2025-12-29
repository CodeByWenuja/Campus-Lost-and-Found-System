import imageCompression from 'browser-image-compression';

export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.7,
  MAX_SIZE_MB: 1.5,
  MAX_FILES: 3,
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
} as const;

export interface CompressedImage {
  file: File;
  preview: string;
  width: number;
  height: number;
}

/**
 * Compresses and resizes an image file
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const options = {
    maxSizeMB: IMAGE_CONFIG.MAX_SIZE_MB,
    maxWidthOrHeight: IMAGE_CONFIG.MAX_WIDTH,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: IMAGE_CONFIG.QUALITY
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // Get dimensions
    const dimensions = await getImageDimensions(compressedFile);

    // Create preview URL
    const preview = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      preview,
      width: dimensions.width,
      height: dimensions.height
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Gets the dimensions of an image file
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validates image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!((IMAGE_CONFIG.ACCEPTED_TYPES as unknown) as string[]).includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Accepted types: ${IMAGE_CONFIG.ACCEPTED_TYPES.join(', ')}`
    };
  }

  const maxSizeBytes = IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${IMAGE_CONFIG.MAX_SIZE_MB}MB`
    };
  }

  return { valid: true };
}

/**
 * Validates array of image files
 */
export function validateImageFiles(files: File[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return { valid: false, error: 'At least one image is required' };
  }

  if (files.length > IMAGE_CONFIG.MAX_FILES) {
    return { valid: false, error: `Maximum ${IMAGE_CONFIG.MAX_FILES} images allowed` };
  }

  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024;

  if (totalSize > maxTotalSize) {
    return {
      valid: false,
      error: `Total file size exceeds ${IMAGE_CONFIG.MAX_SIZE_MB}MB`
    };
  }

  return { valid: true };
}

/**
 * Cleanup object URLs to prevent memory leaks
 */
export function revokeObjectURL(url: string) {
  URL.revokeObjectURL(url);
}
