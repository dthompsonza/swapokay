/** Shares a link to the collection; resolves 'copied' when it fell back to the clipboard. */
export async function shareCollectionLink(code: string): Promise<'shared' | 'copied' | 'none'> {
  const url = `${location.origin}${location.pathname}?collection=${encodeURIComponent(code)}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'SwapOkay collection', url });
      return 'shared';
    } catch {
      return 'none';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'none';
  }
}
