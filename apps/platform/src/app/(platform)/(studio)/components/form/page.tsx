/**
 * components/form/page.tsx
 *
 * Form component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Form } from '@oneui/ui/components/Form';
import { Input } from '@oneui/ui/components/Input';
import { Button } from '@oneui/ui/components/Button';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function FormPage() {
  const [formData, setFormData] = React.useState({ name: '', email: '', subscribe: false });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Form submitted!');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Form</h1>
        <p className={styles.description}>
          A form component that provides a semantic HTML form element with proper submission handling.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Basic Form" description="Simple form with input fields and submit button.">
          <div className={styles.showcase}>
            <Form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-4)',
                padding: 'var(--Spacing-4)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
                  <label htmlFor="name" style={{
                    fontSize: 'var(--Typography-Size-S)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-High)'
                  }}>
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
                  <label htmlFor="email" style={{
                    fontSize: 'var(--Typography-Size-S)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-High)'
                  }}>
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
                  <Checkbox
                    id="subscribe"
                    label="Subscribe to newsletter"
                    checked={formData.subscribe}
                    onCheckedChange={(checked) => setFormData({ ...formData, subscribe: checked })}
                  />
                </div>
                <Button type="submit" attention="high">
                  Submit
                </Button>
              </div>
            </Form>
          </div>
        </FoundationCard>

        <FoundationCard title="Form Layout" description="Form with multiple sections and field groups.">
          <div className={styles.showcase}>
            <Form
              onSubmit={(e) => { e.preventDefault(); alert('Registration form submitted!'); }}
              style={{ width: '100%', maxWidth: '500px' }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-4-5)',
                padding: 'var(--Spacing-4)'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 var(--Spacing-3-5) 0',
                    fontSize: 'var(--Typography-Size-M)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-High)'
                  }}>
                    Account Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                    <Input type="text" placeholder="Username" />
                    <Input type="password" placeholder="Password" />
                    <Input type="password" placeholder="Confirm Password" />
                  </div>
                </div>
                <div>
                  <h3 style={{
                    margin: '0 0 var(--Spacing-3-5) 0',
                    fontSize: 'var(--Typography-Size-M)',
                    fontWeight: 'var(--Typography-Weight-Medium)',
                    color: 'var(--Text-High)'
                  }}>
                    Personal Details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                    <Input type="text" placeholder="Full Name" />
                    <Input type="email" placeholder="Email Address" />
                    <Input type="tel" placeholder="Phone Number" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)' }}>
                  <Button type="submit" attention="high">Create Account</Button>
                  <Button type="button" attention="low">Cancel</Button>
                </div>
              </div>
            </Form>
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Form component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Form, Input, Button, Checkbox } from '@oneui/ui';

// Basic form
const [data, setData] = useState({ name: '', email: '' });

const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log('Form data:', data);
};

<Form onSubmit={handleSubmit}>
  <Input
    type="text"
    placeholder="Name"
    value={data.name}
    onChange={(e) => setData({ ...data, name: e.target.value })}
  />
  <Input
    type="email"
    placeholder="Email"
    value={data.email}
    onChange={(e) => setData({ ...data, email: e.target.value })}
  />
  <Button type="submit">Submit</Button>
</Form>

// Form with validation
<Form onSubmit={(e) => {
  e.preventDefault();
  if (!data.email) {
    alert('Email required');
    return;
  }
  handleSubmit();
}}>
  <Input type="email" placeholder="Email" required />
  <Button type="submit">Submit</Button>
</Form>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Form component." collapsible>
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>-</td>
                <td>Form content (required)</td>
              </tr>
              <tr>
                <td><code>onSubmit</code></td>
                <td><code>(event: FormEvent) =&gt; void</code></td>
                <td>-</td>
                <td>Called on form submission</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional class name</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
