import { describe, expect, it } from 'vitest';
import {
  evaluateCompositionDesignGate,
  inferCompositionDesignArchetype,
} from '../compositionDesignGate';
import { PLAYGROUND_IMAGE_FALLBACK_SRC } from '../playgroundImageAssets';

describe('evaluateCompositionDesignGate', () => {
  it('infers key screen archetypes from the user prompt', () => {
    expect(inferCompositionDesignArchetype('settings page with notifications')).toBe('settings');
    expect(inferCompositionDesignArchetype('e-commerce home with product deals')).toBe('ecommerce');
    expect(inferCompositionDesignArchetype('OTP login screen')).toBe('auth');
  });

  it('lets the user prompt win over commerce-like text in generated settings code', () => {
    expect(
      inferCompositionDesignArchetype(
        'Build a settings page with privacy and notification controls',
        'Offers, deals, shopping preferences, account privacy, Settings',
      ),
    ).toBe('settings');
  });

  it('does not treat plain profile or account screens as settings screens', () => {
    expect(inferCompositionDesignArchetype('profile page with user details')).toBe('generic');
    expect(inferCompositionDesignArchetype('account overview with recent activity')).toBe('generic');
  });

  it('fails settings screens that are dominated by oversized decorative icons', () => {
    const code = `
import { Surface, Container, Icon, Switch } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main">
      <Container>
        <Icon name="notification" style={{ width: 'calc(var(--Spacing-40) * 2)', height: 'calc(var(--Spacing-40) * 2)' }} />
        <span>Notifications</span>
        <Switch />
      </Container>
    </Surface>
  );
}
`;
    const result = evaluateCompositionDesignGate({
      code,
      prompt: 'Settings screen with notification preferences',
      context: 'mobile-app',
    });
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.id === 'giant-icon')).toBe(true);
    expect(result.issues.some((issue) => issue.id === 'settings-giant-icon')).toBe(true);
  });

  it('passes a settings screen with multiple usable controls and compact structure', () => {
    const code = `
import { Surface, Container, Grid, Switch, Select, Icon } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main">
      <Container>
        <Surface mode="subtle" as="section">
          <Grid columns={2}>
            <span>Messages</span>
            <Switch />
          </Grid>
        </Surface>
        <Surface mode="subtle" as="section">
          <Grid columns={2}>
            <span>Promotions</span>
            <Switch />
          </Grid>
        </Surface>
        <Surface mode="subtle" as="section">
          <Icon name="settings" />
          <Select options={[{ label: 'Daily', value: 'daily' }]} />
        </Surface>
      </Container>
    </Surface>
  );
}
`;
    const result = evaluateCompositionDesignGate({
      code,
      prompt: 'Settings screen with notification controls',
      context: 'mobile-app',
    });
    expect(result.passed).toBe(true);
    expect(result.issues.some((issue) => issue.severity === 'error')).toBe(false);
  });

  it('fails e-commerce screens without concrete local product imagery', () => {
    const code = `
import { Surface, Container, Grid, Button, Badge } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main">
      <Container>
        <Grid columns={2}>
          <Surface mode="subtle"><Badge>Deal</Badge></Surface>
          <Surface mode="subtle"><Button>Buy now</Button></Surface>
        </Grid>
      </Container>
    </Surface>
  );
}
`;
    const result = evaluateCompositionDesignGate({
      code,
      prompt: 'E-commerce home app with categories and product deals',
      context: 'mobile-app',
    });
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.id === 'ecommerce-missing-local-image')).toBe(true);
  });

  it('passes e-commerce screens that use seeded local product images', () => {
    const code = `
import { Surface, Container, Grid, Image, Button, Badge } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main">
      <Container>
        <Image src="/playground-assets/images/ecommerce-hero.svg" alt="Shopping offers" />
        <Grid columns={2}>
          <Surface mode="subtle"><Image src="/playground-assets/images/product-card-1.svg" alt="Headphones" /></Surface>
          <Surface mode="subtle"><Badge>Deal</Badge><Button>Buy now</Button></Surface>
        </Grid>
      </Container>
    </Surface>
  );
}
`;
    const result = evaluateCompositionDesignGate({
      code,
      prompt: 'E-commerce home app with product deals',
      context: 'mobile-app',
    });
    expect(result.passed).toBe(true);
    expect(result.issues.some((issue) => issue.id === 'ecommerce-missing-local-image')).toBe(false);
  });

  it('rejects placeholder and remote images as design output', () => {
    const placeholder = evaluateCompositionDesignGate({
      code: `
import { Surface, Image } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Image src="${PLAYGROUND_IMAGE_FALLBACK_SRC}" alt="Placeholder" /></Surface>;
}
`,
      prompt: 'E-commerce product card',
    });
    expect(placeholder.passed).toBe(false);
    expect(placeholder.issues.some((issue) => issue.id === 'placeholder-image')).toBe(true);

    const remote = evaluateCompositionDesignGate({
      code: `
import { Surface, Container, Grid, Image, Button } from '@oneui/playground';
export default function App() {
  return <Surface mode="default"><Container><Grid columns={2}><Image src="https://picsum.photos/300" alt="Remote" /><Button>Buy</Button></Grid></Container></Surface>;
}
`,
      prompt: 'E-commerce product card',
    });
    expect(remote.passed).toBe(false);
    expect(remote.issues.some((issue) => issue.id === 'design-remote-image')).toBe(true);
  });
});
