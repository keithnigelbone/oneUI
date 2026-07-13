export async function copyExecutionLog(text: string): Promise<boolean> {
  if (!text.trim() || typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
