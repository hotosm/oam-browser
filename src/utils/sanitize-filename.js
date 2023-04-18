export function sanitizeFilenameForURL(filename) {
  // Remove any leading or trailing whitespace
  const trimmedFilename = filename.trim();

  // Replace spaces with hyphens
  const hyphenatedFilename = trimmedFilename.replace(/\s+/g, "-");

  // Remove any invalid URL characters
  const sanitizedFilename = hyphenatedFilename.replace(/[^a-zA-Z0-9\-_.]/g, "");

  // If the filename is just hyphens, remove them, then if it's empty, replace it with "file"
  return sanitizedFilename.replace(/^-+$/g, "").replace(/^$/g, "file");
}
