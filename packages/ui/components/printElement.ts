/**
 * Fallback cleanup delay for the hidden print iframe. `window.print()` is
 * modal-blocking in current browsers, so `afterprint` normally fires long
 * before this; it only exists for engines that never fire the event.
 */
const PRINT_IFRAME_TIMEOUT_MS = 60_000;

function collectStyleNodes(): Node[] {
  return Array.from(
    document.head.querySelectorAll('style, link[rel="stylesheet"]'),
  ).map((node) => {
    if (node instanceof HTMLLinkElement) {
      // The iframe document is `about:blank`, so stylesheet hrefs must be
      // absolute or the resume would print unstyled.
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = node.href;
      return link;
    }
    return node.cloneNode(true);
  });
}

/**
 * Prints a single element in isolation: its markup is cloned into a hidden
 * iframe together with the document's stylesheets, and the iframe's own
 * print dialog is invoked. The output contains only that element — no
 * surrounding page chrome and no dependence on `@media print` rules in the
 * host document.
 */
export function printElement(element: HTMLElement): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('title', 'Print');
  Object.assign(iframe.style, {
    border: '0',
    bottom: '0',
    height: '0',
    position: 'fixed',
    right: '0',
    visibility: 'hidden',
    width: '0',
  });

  let timeoutId = 0;
  const cleanup = () => {
    window.clearTimeout(timeoutId);
    iframe.remove();
  };

  iframe.addEventListener('load', () => {
    const printWindow = iframe.contentWindow;
    if (!printWindow) {
      cleanup();
      return;
    }
    printWindow.addEventListener('afterprint', cleanup);
    timeoutId = window.setTimeout(cleanup, PRINT_IFRAME_TIMEOUT_MS);
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Non-browser hosts (e.g. jsdom) may not implement print().
      cleanup();
    }
  });

  document.body.appendChild(iframe);
  const printDocument = iframe.contentDocument;
  if (!printDocument) {
    cleanup();
    return;
  }
  const charset = printDocument.createElement('meta');
  charset.setAttribute('charset', 'utf-8');
  printDocument.head.append(charset, ...collectStyleNodes());
  printDocument.body.append(element.cloneNode(true));
}
