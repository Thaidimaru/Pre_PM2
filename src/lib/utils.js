import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the normalized application base path from Vite env (e.g., '/Pre_PM2/' or '/')
 */
export function getAppBasePath() {
  const base = (import.meta.env?.BASE_URL || '/').trim();
  if (!base.startsWith('/')) return `/${base}`;
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Parses the current or provided pathname relative to base path into a known app page ('dashboard' | 'field' | 'login')
 */
export function getAppRoute(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  const base = getAppBasePath();
  let normalized = pathname;
  if (base !== '/' && normalized.startsWith(base)) {
    normalized = normalized.slice(base.length - 1); // keep leading '/'
  } else if (base !== '/' && normalized === base.slice(0, -1)) {
    normalized = '/';
  } else if (normalized.startsWith('/Pre_PM2/')) {
    normalized = normalized.slice('/Pre_PM2'.length);
  } else if (normalized === '/Pre_PM2') {
    normalized = '/';
  }
  
  const clean = normalized.replace(/\/+$/, '') || '/';
  if (clean === '/dashboard') return 'dashboard';
  if (clean === '/login') return 'login';
  if (clean === '/field' || clean === '/field-visit') return 'field';
  return 'field';
}

/**
 * Formats a target page into a full browser URL including base path
 */
export function getAppUrl(page) {
  const base = getAppBasePath().replace(/\/+$/, '');
  if (page === 'dashboard') return `${base}/dashboard`;
  if (page === 'login') return `${base}/login`;
  return `${base}/` || '/';
}


/**
 * Compresses an image file client-side to a max dimension and JPEG quality.
 * Returns Base64 string without data:image/...;base64, prefix.
 */
export async function compressPhotoFile(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    if (typeof window === 'undefined') return resolve('');

    const reader = new FileReader();
    reader.onerror = () => resolve('');

    if (!file.type || !file.type.startsWith('image/')) {
      reader.onload = () => {
        const res = reader.result || '';
        resolve(typeof res === 'string' && res.includes('base64,') ? res.split('base64,')[1] : res);
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const blobUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(blobUrl);
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fallbackReader();
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;
        resolve(base64);
      } catch (err) {
        fallbackReader();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      fallbackReader();
    };

    function fallbackReader() {
      reader.onload = () => {
        const res = reader.result || '';
        resolve(typeof res === 'string' && res.includes('base64,') ? res.split('base64,')[1] : res);
      };
      reader.readAsDataURL(file);
    }

    img.src = blobUrl;
  });
}
