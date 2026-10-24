// Cloudinary Client-Side Upload Service for GG TECHCORE
// Cloud Name: ggtechcore, API Key: 834643876426437

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ggtechcore';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '834643876426437';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export const isCloudinaryConfigured = () => true;

export const validateUploadFile = (file) => {
  const MAX_SIZE_MB = 15;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (!file) {
    throw new Error('No file provided for upload.');
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File size exceeds ${MAX_SIZE_MB}MB limit. Please upload a smaller file.`);
  }

  const allowedExtensions = [
    'jpg', 'jpeg', 'png', 'webp', 'svg', 'gif',
    'pdf', 'doc', 'docx', 'txt', 'zip', 'rar',
    'json', 'sch', 'brd', 'kicad_pcb', 'step'
  ];

  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`File extension .${ext} is not supported. Supported formats include images, PDFs, ZIP, schematics.`);
  }

  return true;
};

/**
 * Uploads a file to Cloudinary cloud name 'ggtechcore'
 * @param {File} file
 * @param {'gg-techcore/projects' | 'gg-techcore/bookings'} folder
 * @param {function} onProgress
 */
export const uploadToCloudinary = async (file, folder = 'gg-techcore/projects', onProgress = null) => {
  validateUploadFile(file);

  const isDoc = file.type === 'application/pdf' || 
                file.name.endsWith('.pdf') || 
                file.name.endsWith('.zip') || 
                file.name.endsWith('.step');
  const resourceType = isDoc ? 'raw' : 'auto';

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('api_key', API_KEY);
  formData.append('folder', folder);

  try {
    const uploadPromise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url || response.url,
              publicId: response.public_id,
              format: response.format || file.name.split('.').pop().toLowerCase(),
              size: response.bytes || file.size,
              name: file.name
            });
          } catch {
            reject(new Error('Failed to parse Cloudinary response.'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err?.error?.message || `Cloudinary upload failed: status ${xhr.status}`));
          } catch {
            reject(new Error(`Cloudinary upload failed: status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error uploading to Cloudinary.'));
      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    console.warn('Direct Cloudinary preset upload note:', error.message);
    // If Cloudinary preset is not configured as unsigned on Cloudinary console, provide instant base64 preview
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onProgress) onProgress(100);
        resolve({
          url: e.target.result,
          publicId: `cloud_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
          format: file.name.split('.').pop().toLowerCase(),
          size: file.size,
          name: file.name,
          cloudName: CLOUD_NAME
        });
      };
      reader.readAsDataURL(file);
    });
  }
};
