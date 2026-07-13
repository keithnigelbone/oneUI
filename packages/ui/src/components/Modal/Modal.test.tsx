/**
 * Modal.test.tsx
 * Unit and accessibility tests
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

function setBodyScrollState(
  body: HTMLElement,
  metrics: { scrollTop: number; scrollHeight: number; clientHeight: number },
) {
  Object.defineProperty(body, 'scrollTop', { configurable: true, value: metrics.scrollTop });
  Object.defineProperty(body, 'scrollHeight', { configurable: true, value: metrics.scrollHeight });
  Object.defineProperty(body, 'clientHeight', { configurable: true, value: metrics.clientHeight });
  fireEvent.scroll(body);
}

describe('Modal', () => {
  it('renders when open', async () => {
    render(
      <Modal open title="Test Modal">
        <p>Body content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <Modal open={false} title="Hidden Modal">
        <p>Should not appear</p>
      </Modal>,
    );
    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });

  it('renders title when showTitle is true', async () => {
    render(
      <Modal open title="Visible Title" showTitle>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Visible Title')).toBeInTheDocument();
    });
  });

  it('hides title when showTitle is false', async () => {
    render(
      <Modal open title="Hidden Title" showTitle={false}>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.queryByText('Hidden Title')).not.toBeInTheDocument();
    });
  });

  it('renders description when showDescription is true', async () => {
    render(
      <Modal open title="Title" description="A helpful description" showDescription>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('A helpful description')).toBeInTheDocument();
    });
  });

  it('renders description by default when description is provided', async () => {
    render(
      <Modal open title="Title" description="Visible description">
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Visible description')).toBeInTheDocument();
    });
  });

  it('hides description when showDescription is false', async () => {
    render(
      <Modal open title="Title" description="Hidden description" showDescription={false}>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.queryByText('Hidden description')).not.toBeInTheDocument();
    });
  });

  it('renders close button with aria-label', async () => {
    render(
      <Modal open title="Close Test">
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Modal open title="Close Test" onOpenChange={handleOpenChange}>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Close'));
    expect(handleOpenChange).toHaveBeenCalled();
    expect(handleOpenChange.mock.calls[0][0]).toBe(false);
  });

  it('forwards close reason from Base UI on close button click', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Modal open title="Reason Test" onOpenChange={handleOpenChange}>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Close'));
    const [, details] = handleOpenChange.mock.calls[0];
    expect(details).toMatchObject({ reason: 'close-press' });
    expect(details.event).toBeInstanceOf(Event);
    expect(details.cancel).toEqual(expect.any(Function));
  });

  it('uses aria-label as fallback when header is hidden', async () => {
    render(
      <Modal open header={false} aria-label="Confirmation dialog">
        <p>Body only</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Body only')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Confirmation dialog');
  });

  it('uses aria-labelledby when supplied without a rendered title', async () => {
    render(
      <Modal open showTitle={false} aria-labelledby="external-heading">
        <h2 id="external-heading">Outside the dialog</h2>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Body')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'external-heading');
  });

  it('uses title as accessible fallback when the visible title is hidden', async () => {
    render(
      <Modal open title="Fallback title" showTitle={false}>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Fallback title' })).toBeInTheDocument();
    });
  });

  it('renders footer content', async () => {
    render(
      <Modal
        open
        title="Footer Test"
        footerEnd={<button>Save</button>}
      >
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('renders a footer region when footer is true without footer content', async () => {
    render(
      <Modal open title="Empty Footer" footer>
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Empty Footer')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog.lastElementChild).toHaveAttribute('data-footer-orientation', 'horizontal');
  });

  it('hides footer when footer prop is false', async () => {
    render(
      <Modal
        open
        title="No Footer"
        footer={false}
        footerEnd={<button>Should not appear</button>}
      >
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('No Footer')).toBeInTheDocument();
    });
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });

  it('hides header when header prop is false', async () => {
    render(
      <Modal open header={false} title="Hidden Header">
        <p>Body only</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Body only')).toBeInTheDocument();
    });
    expect(screen.queryByText('Hidden Header')).not.toBeInTheDocument();
  });

  it('applies data-size attribute', async () => {
    render(
      <Modal open size="L" title="Large Modal">
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Large Modal')).toBeInTheDocument();
    });
    const popup = screen.getByText('Large Modal').closest('[data-size]');
    expect(popup).toHaveAttribute('data-size', 'L');
  });

  it('defaults to size M when no size prop', async () => {
    render(
      <Modal open title="Default Size">
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Default Size')).toBeInTheDocument();
    });
    const popup = screen.getByText('Default Size').closest('[data-size]');
    expect(popup).toHaveAttribute('data-size', 'M');
  });

  it('renders header start content when provided', async () => {
    render(
      <Modal
        open
        title="With Icon"
        headerStart={<span data-testid="header-icon">★</span>}
      >
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('header-icon')).toBeInTheDocument();
    });
  });

  it('renders footer start content', async () => {
    render(
      <Modal
        open
        title="Footer Start"
        footerStart={<span data-testid="footer-start">Info</span>}
        footerEnd={<button>OK</button>}
      >
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('footer-start')).toBeInTheDocument();
    });
  });

  it('applies vertical footer orientation', async () => {
    render(
      <Modal
        open
        title="Vertical"
        footerOrientation="vertical"
        footerEnd={<button>Action</button>}
      >
        <p>Content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
    const footer = screen.getByText('Action').closest('[data-footer-orientation]');
    expect(footer).toHaveAttribute('data-footer-orientation', 'vertical');
  });

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Modal open title="Escape Test" onOpenChange={handleOpenChange}>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Escape Test')).toBeInTheDocument();
    });
    await user.keyboard('{Escape}');
    expect(handleOpenChange).toHaveBeenCalled();
    const [open, details] = handleOpenChange.mock.calls[0];
    expect(open).toBe(false);
    expect(details).toMatchObject({ reason: 'escape-key' });
  });

  it('does not close via Escape when dismissible is false', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Modal open title="Mandatory Modal" dismissible={false} onOpenChange={handleOpenChange}>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Mandatory Modal')).toBeInTheDocument();
    });
    await user.keyboard('{Escape}');
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Mandatory Modal' })).toBeInTheDocument();
  });

  it('closes on outside press (default Base UI behaviour)', async () => {
    const handleOpenChange = vi.fn();
    render(
      <Modal open title="Outside Test" onOpenChange={handleOpenChange}>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Outside Test')).toBeInTheDocument();
    });
    const backdrop = document.querySelector('[class*="backdrop"]') as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    fireEvent.mouseDown(backdrop);
    fireEvent.mouseUp(backdrop);
    fireEvent.click(backdrop);
    expect(handleOpenChange).toHaveBeenCalled();
  });

  it('does not close via outside press when dismissible is false', async () => {
    const handleOpenChange = vi.fn();
    render(
      <Modal open title="Outside Blocked" dismissible={false} onOpenChange={handleOpenChange}>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Outside Blocked')).toBeInTheDocument();
    });
    const backdrop = document.querySelector('[class*="backdrop"]') as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    fireEvent.mouseDown(backdrop);
    fireEvent.mouseUp(backdrop);
    fireEvent.click(backdrop);
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Outside Blocked' })).toBeInTheDocument();
  });

  it('makes the scrollable body keyboard focusable', async () => {
    render(
      <Modal open title="Scrollable Body">
        <p>Scrollable content</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
    });
    expect(screen.getByText('Scrollable content').parentElement).toHaveAttribute('tabindex', '0');
  });

  it('uses divider scroll-position props as onScroll visibility thresholds', async () => {
    render(
      <Modal
        open
        title="Divider Thresholds"
        dividerTopVisibility="onScroll"
        dividerTopScrollPosition="end"
        dividerBottomVisibility="onScroll"
        dividerBottomScrollPosition="start"
      >
        <p>Scrollable body</p>
      </Modal>,
    );
    await waitFor(() => {
      expect(screen.getByText('Scrollable body')).toBeInTheDocument();
    });
    const body = screen.getByText('Scrollable body').parentElement as HTMLElement;

    setBodyScrollState(body, { scrollTop: 0, scrollHeight: 300, clientHeight: 100 });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-divider]')).toHaveLength(1);
    });

    setBodyScrollState(body, { scrollTop: 100, scrollHeight: 300, clientHeight: 100 });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-divider]')).toHaveLength(0);
    });

    setBodyScrollState(body, { scrollTop: 200, scrollHeight: 300, clientHeight: 100 });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-divider]')).toHaveLength(1);
    });
  });
});
