'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { PLATFORMS } from '../lib/social-platforms';
import type { SocialPlatform } from '../lib/types';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { InputField } from '@oneui/ui/components/Input';
import { Toggle } from '@oneui/ui/components/Toggle';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import styles from './ProjectSettingsPanel.module.css';

interface ProjectRow {
  _id: Id<'createProjects'>;
  name: string;
  description?: string;
  type: 'single' | 'campaign';
  platforms: string[];
  audience?: string;
  tone?: string;
  brief?: string;
}

interface ProjectSettingsPanelProps {
  project: ProjectRow;
  onClose: () => void;
}

const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Bold',
  'Playful',
  'Luxurious',
  'Minimal',
  'Energetic',
  'Warm',
];

export function ProjectSettingsPanel({ project, onClose }: ProjectSettingsPanelProps) {
  const updateProject = useMutation(api.createProjects.update);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [projectType, setProjectType] = useState<'single' | 'campaign'>(project.type);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(project.platforms as SocialPlatform[]);
  const [audience, setAudience] = useState(project.audience ?? '');
  const [tone, setTone] = useState(project.tone ?? '');
  const [brief, setBrief] = useState(project.brief ?? '');

  const handleSave = useCallback(async () => {
    await updateProject({
      projectId: project._id,
      name: name.trim(),
      description: description.trim() || undefined,
      type: projectType,
      platforms,
      audience: audience.trim() || undefined,
      tone: tone || undefined,
      brief: brief.trim() || undefined,
    });
    onClose();
  }, [
    updateProject,
    project._id,
    name,
    description,
    projectType,
    platforms,
    audience,
    tone,
    brief,
    onClose,
  ]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Project settings</h2>
          <IconButton
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            attention="low"
            appearance="neutral"
            size="medium"
            aria-label="Close"
            onPress={onClose}
          />
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Project type</label>
            <ToggleGroup
              value={[projectType]}
              onValueChange={(values) =>
                setProjectType((values[0] as 'single' | 'campaign') ?? 'single')
              }
              variant="subtool"
            >
              <ToggleGroup.Item value="single">Single asset</ToggleGroup.Item>
              <ToggleGroup.Item value="campaign">Campaign</ToggleGroup.Item>
            </ToggleGroup>
          </div>

          <div className={styles.field}>
            <InputField
              label="Name"
              value={name}
              onChange={setName}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Platforms</label>
            <div className={styles.platformChips}>
              {PLATFORMS.map((p) => (
                <Toggle
                  key={p.id}
                  pressed={platforms.includes(p.id)}
                  onPressedChange={(pressed) => {
                    setPlatforms((prev) =>
                      pressed ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                    );
                  }}
                  size="small"
                >
                  {p.label}
                </Toggle>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description…"
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <InputField
              label="Target audience"
              value={audience}
              onChange={setAudience}
              placeholder="e.g. Young professionals 25-35"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tone</label>
            <div className={styles.platformChips}>
              {TONE_OPTIONS.map((t) => (
                <Toggle
                  key={t}
                  pressed={tone === t}
                  onPressedChange={(pressed) => setTone(pressed ? t : '')}
                  size="small"
                >
                  {t}
                </Toggle>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Creative brief</label>
            <textarea
              className={styles.textarea}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Key messages, visual direction…"
              rows={4}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Button attention="high" onPress={handleSave}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
