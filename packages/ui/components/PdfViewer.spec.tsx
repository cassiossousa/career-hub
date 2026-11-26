import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { PdfViewer } from './PdfViewer';

describe('PdfViewer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.querySelectorAll('iframe[title="Print"]').forEach((node) => {
      node.remove();
    });
  });

  it('renders children inside a print page', () => {
    render(
      <PdfViewer>
        <p>Document body</p>
      </PdfViewer>,
    );

    const page = document.querySelector('.resume-print-page');
    expect(page).toBeInTheDocument();
    expect(page?.textContent).toContain('Document body');
  });

  it('prints only the page through a hidden iframe when the label is set', () => {
    render(
      <PdfViewer printLabel="Print">
        <p>Document body</p>
      </PdfViewer>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Print' }));

    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe[title="Print"]',
    );
    if (!iframe) {
      throw new Error('print iframe was not appended');
    }
    expect(iframe.contentDocument?.body.textContent).toContain('Document body');

    const printWindow = iframe.contentWindow;
    if (!printWindow) {
      throw new Error('iframe has no content window');
    }
    const print = jest.fn();
    Object.defineProperty(printWindow, 'print', { value: print });
    iframe.dispatchEvent(new Event('load'));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('does not render a button without a print label', () => {
    render(
      <PdfViewer>
        <p>Document body</p>
      </PdfViewer>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('replaces the single page with paged content when provided', () => {
    render(
      <PdfViewer pagedContent={<div data-testid="paged">Paged body</div>}>
        <p>Ignored</p>
      </PdfViewer>,
    );

    expect(screen.getByTestId('paged')).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
    expect(
      document.querySelector('.resume-print-page'),
    ).not.toBeInTheDocument();
  });
});
