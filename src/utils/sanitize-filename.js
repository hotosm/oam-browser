export function sanitizeFilenameForURL(filename) {
  // Remove any leading or trailing whitespace
  const trimmedFilename = filename.trim();

  // Replace spaces with hyphens
  const hyphenatedFilename = trimmedFilename.replace(/\s+/g, "-");

  // Remove any invalid URL characters
  const sanitizedFilename = hyphenatedFilename.replace(/[^a-zA-Z0-9\-_.]/g, "");

  return sanitizedFilename === "" ? "file" : sanitizedFilename;
}
