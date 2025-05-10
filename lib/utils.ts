/**
 * Safely encodes a URL string with support for Chinese characters
 * @param url The URL string to encode
 * @returns Encoded URL string
 */
export function encodeUrlWithChinese(url: string): string {
  // First perform standard encodeURI to handle basic characters
  // Then specially encode Chinese characters that might not be handled properly
  return encodeURI(url)
    .replace(/%5B/g, '[')
    .replace(/%5D/g, ']')
    .replace(/%20/g, ' ');
}

/**
 * Decodes a URL string that may contain encoded Chinese characters
 * @param url The URL string to decode
 * @returns Decoded URL string
 */
export function decodeUrlWithChinese(url: string): string {
  return decodeURI(url);
}

/**
 * Converts a post filename to a URL slug with Chinese character support
 * @param filename The post filename (e.g. '中文标题.md')
 * @returns URL-safe slug
 */
export function filenameToSlug(filename: string): string {
  // Remove file extension and encode the string
  const nameWithoutExtension = filename.replace(/\.(md|mdx)$/, '');
  return encodeUrlWithChinese(nameWithoutExtension);
}

/**
 * Converts a URL slug back to a post filename
 * @param slug The URL slug
 * @returns Original filename (without extension)
 */
export function slugToFilename(slug: string): string {
  return decodeUrlWithChinese(slug);
}
