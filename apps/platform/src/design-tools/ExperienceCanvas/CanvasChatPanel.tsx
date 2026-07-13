/**
 * CanvasChatPanel.tsx
 *
 * Right-docked panel built entirely from `@oneui/ui-internal` primitives.
 * Three tabs — Chat / Edit / Code — hosted in `Tabs`. The Chat tab delegates
 * its whole presentation to `ChatSurface` + `ChatComposer`, so the empty
 * state (centred greeting + suggestion chips) and the conversation layout
 * (pinned composer, message bubbles, streaming indicator) come for free and
 * match the rest of the product visually.
 *
 * Generation state lives in `useCanvasChat` — the hook owns fetch, image
 * upload, model selection, and transcript shaping. This component is a
 * view.
 */

'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { track, useEditor } from 'tldraw';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import { Icon } from '@oneui/ui-internal/icons/Icon';
import { Tabs } from '@oneui/ui-internal/components/Tabs/Tabs';
import { SegmentedControl } from '@oneui/ui-internal/components/SegmentedControl/SegmentedControl';
import { Menu } from '@oneui/ui-internal/components/Menu/Menu';
import { ScrollArea } from '@oneui/ui-internal/components/ScrollArea/ScrollArea';
import {
  astToReact,
  astToReactComponent,
  astToNextPage,
  astToReactNativeScreen,
} from '@oneui/shared/codegen';
import type { ASTRoot } from '@oneui/shared';
import { SelectionPanel } from './SelectionPanel';
import { canvasToAST } from './useCanvasEditor';
import {
  CANVAS_CHAT_MODELS,
  useCanvasChat,
  type GenerationMode,
} from './useCanvasChat';
import { SKETCH_VIEWPORTS, type SketchViewport } from './SketchHTMLShape';
import styles from './CanvasChatPanel.module.css';

// Lazy-import ChatSurface / ChatComposer via the internal alias — the alias
// is the project's approved internal import path for `@oneui/ui` primitives.
import { ChatSurface } from '@oneui/ui-internal/components/ChatSurface/ChatSurface';

type ExportMode = 'fragment' | 'component' | 'nextpage' | 'native';

const STARTER_SUGGESTIONS = [
  'Login screen with sign in and forgot password',
  'Settings page with notification toggles',
  'Product detail with image and buy button',
  'Onboarding flow with 3 screens',
];

function renderCode(ast: ASTRoot | null, mode: ExportMode): string | null {
  if (!ast) return null;
  switch (mode) {
    case 'component':
      return astToReactComponent(ast, { indent: 2, importSource: '@oneui/ui', componentName: 'MyScreen' });
    case 'nextpage':
      return astToNextPage(ast, { pageName: 'MyPage', importSource: '@oneui/ui' });
    case 'native':
      return astToReactNativeScreen(ast, { screenName: 'MyScreen', importSource: '@oneui/ui' });
    default:
      return astToReact(ast, { indent: 2, importSource: '@oneui/ui' });
  }
}

export const CanvasChatPanel = track(function CanvasChatPanel() {
  const editor = useEditor();
  const [tab, setTab] = useState<string | number>('chat');
  const [exportMode, setExportMode] = useState<ExportMode>('fragment');
  const [copied, setCopied] = useState(false);
  // Controlled composer value — required so the trailing Send button can
  // submit without relying on Enter keypress.
  const [composerValue, setComposerValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const chat = useCanvasChat(editor as any);

  const handleSendClick = useCallback(() => {
    const trimmed = composerValue.trim();
    if (!trimmed) return;
    chat.submit(trimmed);
    setComposerValue('');
  }, [composerValue, chat]);


  const handleGreetingSuggestion = useCallback(
    (prompt: string) => {
      chat.submit(prompt);
    },
    [chat],
  );

  // ── Chat composer adornments ────────────────────────────────────────────
  const modeOptions = useMemo(
    () => [
      { value: 'compose' as GenerationMode, label: 'Compose' },
      { value: 'sketch' as GenerationMode, label: 'Sketch' },
    ],
    [],
  );

  // Composer slots — only + attach and Send live inside the composer box
  // itself. Mode toggle moves above the composer; model picker sits below.
  const composerLeading = (
    <>
      <input
        // Hidden file input — programmatically opened by the Attach IconButton.
        // Inline <input type="file"> is the only native HTML allowed here: no
        // DS primitive exists for file pickers, and it stays `display: none`.
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenFileInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) chat.attachImage(file);
          e.target.value = '';
        }}
      />
      <IconButton
        icon={<Icon name="add" />}
        appearance="neutral"
        attention="low"
        size="s"
        onPress={() => fileInputRef.current?.click()}
        aria-label="Attach image"
      />
    </>
  );

  const composerTrailing = (
    <IconButton
      icon={<Icon name="arrowUp" />}
      appearance="primary"
      attention="high"
      size="s"
      onPress={handleSendClick}
      disabled={!composerValue.trim() || chat.status === 'streaming'}
      aria-label="Send"
    />
  );

  // aboveComposer — only the optional image preview thumb now. The mode
  // picker moved into the composer footer alongside the model menu.
  const aboveComposer = chat.imagePreview ? (
    <div className={styles.aboveComposerStack}>
      <div className={styles.imagePreviewRow}>
        <img src={chat.imagePreview} alt="Reference" className={styles.imagePreview} />
        <IconButton
          icon={<Icon name="close" />}
          appearance="neutral"
          attention="low"
          size="s"
          onPress={chat.clearImage}
          aria-label="Remove image"
        />
      </div>
    </div>
  ) : null;

  const currentModeOption = modeOptions.find((o) => o.value === chat.mode);

  // Composer footer — sits below the composer input. Houses the
  // Compose/Sketch dropdown and the model picker side-by-side.
  const modelPickerRow = (
    <div className={styles.modelFooter}>
      <Menu>
        <Menu.Trigger
          render={
            <Button
              appearance="neutral"
              attention="low"
              size="s"
              end={<Icon name="chevronDown" />}
            >
              {currentModeOption?.label ?? 'Compose'}
            </Button>
          }
        />
        <Menu.Portal side="top" align="start">
          {modeOptions.map((opt) => (
            <Menu.Item
              key={opt.value}
              onClick={() => chat.setMode(opt.value)}
            >
              {opt.label}
            </Menu.Item>
          ))}
        </Menu.Portal>
      </Menu>
      {chat.mode === 'sketch' && (
        <Menu>
          <Menu.Trigger
            render={
              <Button
                appearance="neutral"
                attention="low"
                size="s"
                end={<Icon name="chevronDown" />}
              >
                {chat.sketchViewport}
              </Button>
            }
          />
          <Menu.Portal side="top" align="start">
            {(Object.keys(SKETCH_VIEWPORTS) as SketchViewport[]).map((v) => (
              <Menu.Item key={v} onClick={() => chat.setSketchViewport(v)}>
                {v}
              </Menu.Item>
            ))}
          </Menu.Portal>
        </Menu>
      )}
      <span className={styles.modelFooterSpacer} aria-hidden />
      <Menu>
        <Menu.Trigger
          render={
            <Button
              appearance="neutral"
              attention="low"
              size="s"
              end={<Icon name="chevronDown" />}
            >
              {chat.modelLabel}
            </Button>
          }
        />
        <Menu.Portal side="top" align="end">
          {CANVAS_CHAT_MODELS.map((m) => (
            <Menu.Item key={m.value} onClick={() => chat.setModel(m.value)}>
              {m.label}
            </Menu.Item>
          ))}
        </Menu.Portal>
      </Menu>
    </div>
  );

  // Greeting with inline suggestions — small outlined pills beneath the
  // subtitle, stacked vertically à la Magic Path ("Make it more modern
  // looking", "Change the color scheme to blue", etc.).
  const greeting = (
    <div className={styles.greeting}>
      <Icon name="sparkles" />
      <h2 className={styles.greetingTitle}>What would you like to create?</h2>
      <p className={styles.greetingSubtitle}>
        Describe a screen, component, or flow — the canvas will build it.
      </p>
      <ul className={styles.greetingSuggestions} aria-label="Suggested prompts">
        {STARTER_SUGGESTIONS.map((label) => (
          <li key={label}>
            <Button
              appearance="neutral"
              attention="low"
              size="s"
              onPress={() => handleGreetingSuggestion(label)}
            >
              {label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );

  // ── Code tab ────────────────────────────────────────────────────────────
  const ast = tab === 'code'
    ? (() => {
        try {
          return canvasToAST(editor);
        } catch {
          return null;
        }
      })()
    : null;
  const code = useMemo(() => renderCode(ast, exportMode), [ast, exportMode]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback — legacy browsers.
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [code]);

  const handleDownload = useCallback(() => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyScreen.tsx';
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const exportOptions = useMemo(
    () => [
      { value: 'fragment' as ExportMode, label: 'JSX' },
      { value: 'component' as ExportMode, label: 'Component' },
      { value: 'nextpage' as ExportMode, label: 'Next.js' },
      { value: 'native' as ExportMode, label: 'Native' },
    ],
    [],
  );

  return (
    <aside className={styles.panel} aria-label="Canvas panel">
      <Tabs value={tab} onValueChange={(v) => setTab(v ?? 'chat')}>
        <div className={styles.tabBarWrap}>
          <Tabs.List>
            <Tabs.Item value="chat">Chat</Tabs.Item>
            <Tabs.Item value="edit">Edit</Tabs.Item>
            <Tabs.Item value="code">Code</Tabs.Item>
            <Tabs.Indicator />
          </Tabs.List>
        </div>

        <Tabs.Panel value="chat" className={styles.panel_chat}>
          <ChatSurface
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            onSubmit={(text) => {
              chat.submit(text);
              setComposerValue('');
            }}
            value={composerValue}
            onValueChange={setComposerValue}
            greeting={greeting}
            aboveComposer={aboveComposer}
            composerProps={{
              placeholder: 'Describe a screen, component, or flow…',
              leading: composerLeading,
              trailing: composerTrailing,
            }}
            className={styles.chatSurface}
          />
          {modelPickerRow}
        </Tabs.Panel>

        <Tabs.Panel value="edit" className={styles.panel_edit}>
          <ScrollArea className={styles.editScroll}>
            <SelectionPanel />
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="code" className={styles.panel_code}>
          <div className={styles.codeHeader}>
            <SegmentedControl
              value={exportMode}
              onValueChange={(v) => setExportMode(v as ExportMode)}
              size="s"
              aria-label="Export mode"
            >
              {exportOptions.map((opt) => (
                <SegmentedControl.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl>
            <div className={styles.codeActions}>
              <IconButton
                icon={<Icon name="copy" />}
                appearance="neutral"
                attention="low"
                size="s"
                onPress={handleCopy}
                disabled={!code}
                aria-label={copied ? 'Copied' : 'Copy code'}
              />
              <IconButton
                icon={<Icon name="download" />}
                appearance="neutral"
                attention="low"
                size="s"
                onPress={handleDownload}
                disabled={!code}
                aria-label="Download .tsx"
              />
            </div>
          </div>
          <ScrollArea className={styles.codeBody}>
            {code ? (
              <pre className={styles.codeBlock}>
                <code>{code}</code>
              </pre>
            ) : (
              <p className={styles.emptyState}>Add components to see the exported code.</p>
            )}
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
});
