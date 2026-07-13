/**
 * ProjectWizard — New project: single asset vs campaign, then details (Experience CampaignWizard pattern).
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogPortal } from '@oneui/ui/components/Dialog';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Toggle } from '@oneui/ui/components/Toggle';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { InputField } from '@oneui/ui/components/Input';
import { PLATFORMS } from '../lib/social-platforms';
import type { SocialPlatform, AssetType } from '../lib/types';
import styles from './ProjectWizard.module.css';

export interface ReferenceImage {
  name: string;
  type: string;
  dataUrl: string;
}

export interface ProjectWizardData {
  projectType: 'single' | 'campaign';
  name: string;
  description?: string;
  platforms: SocialPlatform[];
  audience?: string;
  tone?: string;
  objectives?: string[];
  brief?: string;
  assetType?: AssetType;
  referenceImages?: ReferenceImage[];
}

interface ProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: ProjectWizardData) => void;
  isCreating?: boolean;
}

const ASSET_TYPE_OPTIONS = [
  { id: 'social-post', label: 'Social Post' },
  { id: 'ad-banner', label: 'Ad Banner' },
  { id: 'story-reel', label: 'Story / Reel' },
];

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

export function ProjectWizard({ open, onClose, onCreate, isCreating }: ProjectWizardProps) {
  const [projectType, setProjectType] = useState<'single' | 'campaign'>('single');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [assetType, setAssetType] = useState<AssetType>('social-post');
  const [showOptional, setShowOptional] = useState(false);
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [brief, setBrief] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = useCallback((platform: SocialPlatform, pressed: boolean) => {
    setPlatforms((prev) => (pressed ? [...prev, platform] : prev.filter((p) => p !== platform)));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = () => {
        setReferenceImages((prev) => [
          ...prev,
          { name: file.name, type: file.type, dataUrl: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, []);

  const removeReferenceImage = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isValid = name.trim().length > 0 && platforms.length > 0;

  const handleCreate = useCallback(() => {
    if (!isValid || isCreating) return;
    onCreate({
      projectType,
      name: name.trim(),
      description: description.trim() || undefined,
      platforms,
      audience: audience.trim() || undefined,
      tone: tone || undefined,
      brief: brief.trim() || undefined,
      assetType,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    });
  }, [
    isValid,
    isCreating,
    projectType,
    name,
    description,
    platforms,
    audience,
    tone,
    brief,
    assetType,
    referenceImages,
    onCreate,
  ]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) onClose();
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} dismissible>
      <DialogPortal title="New project" size="large">
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Project type *</label>
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
              label="Project name *"
              placeholder="e.g. Summer launch 2026"
              value={name}
              onChange={setName}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Asset type</label>
            <ToggleGroup
              value={[assetType]}
              onValueChange={(values) => setAssetType((values[0] as AssetType) ?? 'social-post')}
              variant="subtool"
            >
              {ASSET_TYPE_OPTIONS.map((opt) => (
                <ToggleGroup.Item key={opt.id} value={opt.id}>
                  {opt.label}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Platforms *</label>
            <div className={styles.chips}>
              {PLATFORMS.map((p) => (
                <Toggle
                  key={p.id}
                  pressed={platforms.includes(p.id)}
                  onPressedChange={(pressed) => togglePlatform(p.id, pressed)}
                  size="small"
                >
                  {p.label}
                </Toggle>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Reference images</label>
            <div className={styles.referenceArea}>
              {referenceImages.map((img, i) => (
                <div key={i} className={styles.referenceThumbnail}>
                  <img src={img.dataUrl} alt={img.name} className={styles.referenceImg} />
                  <IconButton
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    }
                    attention="low"
                    appearance="neutral"
                    size="small"
                    className={styles.referenceRemove}
                    aria-label={`Remove ${img.name}`}
                    onPress={() => removeReferenceImage(i)}
                  />
                </div>
              ))}
              <Button
                attention="low"
                size="small"
                className={styles.referenceAdd}
                onPress={() => fileInputRef.current?.click()}
                start={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                }
              >
                Add images
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Brief description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should we build?"
              rows={3}
            />
          </div>

          {!showOptional && (
            <Button attention="low" appearance="neutral" onPress={() => setShowOptional(true)}>
              + Audience, tone, and brief
            </Button>
          )}

          {showOptional && (
            <div className={styles.optionalFields}>
              <div className={styles.field}>
                <InputField
                  label="Target audience"
                  placeholder="e.g. Young professionals 25–35"
                  value={audience}
                  onChange={setAudience}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tone</label>
                <div className={styles.chips}>
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
          )}
        </div>

        <div className={styles.footer}>
          <Button attention="low" appearance="neutral" onPress={onClose}>
            Cancel
          </Button>
          <Button
            attention="high"
            disabled={!isValid || isCreating}
            loading={isCreating}
            onPress={handleCreate}
          >
            Create project
          </Button>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
