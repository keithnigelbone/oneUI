/**
 * Modal.a11y.test.tsx
 *
 * Axe-based accessibility coverage for the Modal component family.
 * Companion to Modal.test.tsx (which holds behavioural tests). Lives in a
 * separate file so `pnpm test:a11y` (vitest.a11y.config.ts) can run it in
 * isolation without pulling in the rest of the unit suite.
 *
 * Each scenario covers a distinct rendered tree the dialog can produce:
 *   - default (title + body + footer)
 *   - title + description + always-on dividers
 *   - header hidden with aria-label fallback
 *   - aria-labelledby fallback when title is hidden
 *   - vertical footer + footerStart slot
 *   - headerStart icon slot
 */

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from '../../test-utils/a11y';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

describe('Modal — accessibility', () => {
  it('default modal (title + body + footer) has no violations', async () => {
    const { container } = render(
      <Modal
        open
        title="Default modal"
        footerEnd={
          <>
            <Button type="button">Cancel</Button>
            <Button type="button">Confirm</Button>
          </>
        }
      >
        <p>This is the modal body content.</p>
      </Modal>
    );
    await expectNoA11yViolations(container);
  });

  it('title + description + always-on dividers has no violations', async () => {
    const { container } = render(
      <Modal
        open
        title="Settings"
        description="Configure your workspace preferences."
        dividerTopVisibility="always"
        dividerBottomVisibility="always"
        footerEnd={
          <>
            <Button attention="low">Cancel</Button>
            <Button attention="high">Save</Button>
          </>
        }
      >
        <p>Settings body content.</p>
      </Modal>
    );
    await expectNoA11yViolations(container);
  });

  it('header={false} with aria-label fallback has no violations', async () => {
    const { container } = render(
      <Modal
        open
        header={false}
        aria-label="Quick action confirmation"
        footerEnd={<Button attention="high">OK</Button>}
      >
        <p>Body content stands alone, with the aria-label naming the dialog.</p>
      </Modal>
    );
    await expectNoA11yViolations(container);
  });

  it('aria-labelledby fallback when title is hidden has no violations', async () => {
    const { container } = render(
      <>
        <h2 id="external-heading">Project rename</h2>
        <Modal open showTitle={false} aria-labelledby="external-heading">
          <p>Body content; the dialog name comes from an external heading.</p>
        </Modal>
      </>
    );
    await expectNoA11yViolations(container);
  });

  it('vertical footer + footerStart slot has no violations', async () => {
    const { container } = render(
      <Modal
        open
        title="Subscribe"
        footerOrientation="vertical"
        footerStart={<a href="#terms">Terms apply</a>}
        footerEnd={
          <>
            <Button attention="high" fullWidth>Subscribe</Button>
            <Button attention="low" fullWidth>Not now</Button>
          </>
        }
      >
        <p>Choose a plan to continue.</p>
      </Modal>
    );
    await expectNoA11yViolations(container);
  });

  it('headerStart icon slot has no violations', async () => {
    const { container } = render(
      <Modal
        open
        title="Inbox"
        headerStart={<span aria-hidden="true">📨</span>}
        footerEnd={<Button attention="high">Done</Button>}
      >
        <p>You have new messages.</p>
      </Modal>
    );
    await expectNoA11yViolations(container);
  });
});
