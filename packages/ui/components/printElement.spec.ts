import '@testing-library/jest-dom';
import { printElement } from './printElement';

function lastIframe(): HTMLIFrameElement {
  const iframe = document.querySelector<HTMLIFrameElement>(
    'iframe[title="Print"]',
  );
  if (!iframe) {
    throw new Error('print iframe was not appended');
  }
  return iframe;
}

/** Prints a host element and stubs the iframe's `print` with `impl`. */
function printWithStubbedWindow(impl: () => void = () => undefined) {
  const host = document.createElement('div');
  host.textContent = 'content';
  document.body.appendChild(host);

  printElement(host);
  const iframe = lastIframe();
  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    throw new Error('iframe has no content window');
  }
  const print = jest.fn(impl);
  Object.defineProperty(printWindow, 'print', { value: print });
  return { host, iframe, print, printWindow };
}

describe('printElement', () => {
  afterEach(() => {
    document.querySelectorAll('iframe[title="Print"]').forEach((node) => {
      node.remove();
    });
  });

  it('clones the element markup and document styles into a hidden iframe', () => {
    const host = document.createElement('article');
    host.className = 'resume-print-page';
    host.textContent = 'Ada Lovelace';
    document.body.appendChild(host);

    printElement(host);

    const iframe = lastIframe();
    expect(iframe.style.visibility).toBe('hidden');
    const printDocument = iframe.contentDocument;
    expect(printDocument?.body.textContent).toContain('Ada Lovelace');
    // The clone lives in the iframe's document — a different realm than the
    // test document, so assert on the node itself rather than jest-dom's
    // in-the-document matcher.
    const cloned = printDocument?.querySelector('.resume-print-page');
    expect(cloned).not.toBeNull();
    expect(cloned?.textContent).toBe('Ada Lovelace');

    host.remove();
  });

  it('prints the iframe document on load and removes it after printing', () => {
    const { host, iframe, print, printWindow } = printWithStubbedWindow();

    iframe.dispatchEvent(new Event('load'));
    expect(print).toHaveBeenCalledTimes(1);

    printWindow.dispatchEvent(new Event('afterprint'));
    expect(
      document.querySelector('iframe[title="Print"]'),
    ).not.toBeInTheDocument();

    host.remove();
  });

  it('absolutizes stylesheet links so the iframe document stays styled', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/app.css';
    document.head.appendChild(link);
    const host = document.createElement('div');
    host.textContent = 'styled';
    document.body.appendChild(host);

    printElement(host);

    const markup = lastIframe().contentDocument?.head.innerHTML ?? '';
    expect(markup).toContain('rel="stylesheet"');
    expect(markup).toContain(link.href);

    link.remove();
    host.remove();
  });

  it('removes the iframe when the load handler finds no content window', () => {
    const contentWindow = jest
      .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
      .mockReturnValue(null);
    const host = document.createElement('div');
    document.body.appendChild(host);

    printElement(host);
    const iframe = lastIframe();
    iframe.dispatchEvent(new Event('load'));

    expect(
      document.querySelector('iframe[title="Print"]'),
    ).not.toBeInTheDocument();

    contentWindow.mockRestore();
    host.remove();
  });

  it('cleans up when the iframe print call throws', () => {
    const { host, iframe } = printWithStubbedWindow(() => {
      throw new Error('print unavailable');
    });

    iframe.dispatchEvent(new Event('load'));

    expect(
      document.querySelector('iframe[title="Print"]'),
    ).not.toBeInTheDocument();

    host.remove();
  });

  it('removes the iframe when the iframe document is unavailable', () => {
    const contentDocument = jest
      .spyOn(HTMLIFrameElement.prototype, 'contentDocument', 'get')
      .mockReturnValue(null);
    const host = document.createElement('div');
    document.body.appendChild(host);

    printElement(host);

    expect(
      document.querySelector('iframe[title="Print"]'),
    ).not.toBeInTheDocument();

    contentDocument.mockRestore();
    host.remove();
  });
});
