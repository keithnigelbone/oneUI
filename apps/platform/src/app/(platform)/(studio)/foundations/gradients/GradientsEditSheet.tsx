/**
 * GradientsEditSheet.tsx
 *
 * Brand-config editor rendered inside the reusable <Sheet> on the Gradients
 * page. Edits a draft list of gradients — each with a type (linear/radial/
 * conic), type-dependent geometry, colour stops (position + opacity), and an
 * on-colour. Colours can be picked from the brand's colour scales. Callers
 * commit the draft on Save. Layout mirrors the Figma "Edit Gradients" card.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GradientDef, GradientStop, GradientType, RadialShape } from '@oneui/shared';
import { Input } from '@oneui/ui/components/Input';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Chip } from '@oneui/ui/components/Chip';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Select } from '@oneui/ui/components/Select';
import { Slider } from '@oneui/ui-internal/components/Slider';
import { Icon } from '@oneui/ui/components/Icon';
import styles from './GradientsEditSheet.module.css';

/** One brand colour scale (role) with its resolved 25 steps. */
export interface GradientColorScale {
  name: string;
  steps: { step: number; hex: string }[];
}

const TYPE_OPTIONS: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'linear' },
  { value: 'radial', label: 'radial' },
  { value: 'conic', label: 'conic' },
];

// Circle first to match the Figma default order.
const SHAPE_OPTIONS: { value: RadialShape; label: string }[] = [
  { value: 'circle', label: 'circle' },
  { value: 'ellipse', label: 'ellipse' },
];

const SIZE_OPTIONS = [
  { value: 'closest-side', label: 'closest-side' },
  { value: 'closest-corner', label: 'closest-corner' },
  { value: 'farthest-side', label: 'farthest-side' },
  { value: 'farthest-corner', label: 'farthest-corner' },
];

/** Monotonic counter so the fallback path stays unique even within one tick. */
let idCounter = 0;

/** Unique id for a new gradient / stop. Runtime-only (browser). */
function makeId(prefix: string): string {
  idCounter += 1;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  // Non-secure contexts (plain-HTTP origins) lack crypto.randomUUID; Date.now()
  // alone collides for ids minted in the same millisecond (e.g. a new
  // gradient's two default stops), so append a process-unique counter.
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** Parse a numeric Input string, keeping the previous value on garbage. */
function toNum(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Colour of the stop nearest a given position — used to seed a new stop. */
function colorAtPosition(stops: GradientStop[], position: number): string {
  let nearest = stops[0];
  for (const s of stops) {
    if (Math.abs(s.position - position) < Math.abs(nearest.position - position)) nearest = s;
  }
  return nearest?.color ?? '#FFFFFF';
}

/** If a colour exactly matches a brand scale step, return its "role-step" name. */
function nameForColor(hex: string, scales: GradientColorScale[]): string | null {
  const target = hex.trim().toLowerCase();
  for (const scale of scales) {
    for (const st of scale.steps) {
      if (st.hex.toLowerCase() === target) return `${scale.name}-${st.step}`;
    }
  }
  return null;
}

/** Small round native colour picker (custom colour). */
function ColorSwatch({
  color,
  onChange,
  ariaLabel,
}: {
  color: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="color"
      className={styles.colorSwatch}
      value={color}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
    />
  );
}

/**
 * Colour field: an Input (so heights match the other fields) whose leading
 * swatch opens a popover for picking from the brand colour scales. The hex is
 * still editable inline, and the popover also offers a native custom picker.
 */
function BrandColorField({
  value,
  onChange,
  colorScales,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  colorScales: GradientColorScale[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  const hasScales = colorScales.length > 0;
  const matched = nameForColor(value, colorScales);
  // Show the brand scale-step name when the colour maps to one, else the hex.
  const display = matched ?? value;

  // Filter the popover by scale name, or by step number when the query is numeric.
  const q = query.trim().toLowerCase();
  const numeric = /^\d+$/.test(q);
  const filtered = !q
    ? colorScales
    : colorScales
        .map((scale) => {
          if (numeric) {
            const steps = scale.steps.filter((st) => String(st.step).includes(q));
            return steps.length ? { ...scale, steps } : null;
          }
          return scale.name.toLowerCase().includes(q) ? scale : null;
        })
        .filter((s): s is GradientColorScale => s !== null);

  const pick = (hex: string) => {
    onChange(hex);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapRef} className={styles.colorFieldWrap}>
      {/* The whole field is the trigger (like a dropdown), not just the swatch. */}
      <div
        className={styles.colorFieldTrigger}
        role="button"
        tabIndex={hasScales ? 0 : -1}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${ariaLabel} — pick colour`}
        title={matched ? `${matched} · ${value}` : value}
        onClick={() => hasScales && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (hasScales && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Input
          value={display}
          readOnly
          size="s"
          aria-label={ariaLabel}
          start={
            <span className={styles.swatchTrigger} style={{ background: value }} aria-hidden="true" />
          }
          end={hasScales ? <Icon icon="chevronDown" aria-hidden /> : undefined}
        />
      </div>
      {open && hasScales && (
        <div className={styles.colorPopover} role="dialog" aria-label="Brand colours">
          <div className={styles.searchRow}>
            <Input
              value={query}
              onChange={setQuery}
              size="s"
              placeholder="Search scale or step"
              aria-label="Search colours"
              start={<Icon icon="search" />}
            />
          </div>
          <div className={styles.scaleList}>
            {filtered.map((scale) => (
              <div key={scale.name} className={styles.scaleRow}>
                <span className={styles.scaleName}>{scale.name}</span>
                <div className={styles.swatchGrid}>
                  {scale.steps.map((st) => (
                    <button
                      key={st.step}
                      type="button"
                      className={styles.scaleSwatch}
                      style={{ background: st.hex }}
                      title={`${scale.name}-${st.step} · ${st.hex}`}
                      aria-label={`${scale.name} ${st.step}`}
                      onClick={() => pick(st.hex)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <span className={styles.emptyText}>No matches</span>}
          </div>
          <div className={styles.customRow}>
            <span className={styles.customLabel}>Custom</span>
            <ColorSwatch color={value} onChange={onChange} ariaLabel="Custom colour" />
            <div className={styles.customHex}>
              <Input value={value} onChange={onChange} size="s" aria-label="Custom hex" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Live gradient track with draggable stop handles. The bar always renders a
 * left-to-right (90deg) preview of the stops regardless of the gradient's
 * actual type, so the colour transition and stop positions are editable
 * visually. Click the track to add a stop; drag a handle to reposition it.
 */
function GradientStopsBar({
  stops,
  onPositionChange,
  onAddStop,
}: {
  stops: GradientStop[];
  onPositionChange: (stopId: string, position: number) => void;
  onAddStop: (position: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<string | null>(null);

  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const trackCSS = `linear-gradient(90deg, ${sorted
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ')})`;

  const positionFromClientX = (clientX: number): number => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return Math.round(Math.min(100, Math.max(0, pct)));
  };

  return (
    <div
      ref={barRef}
      className={styles.stopsBar}
      style={{ background: trackCSS }}
      onPointerDown={(e) => {
        if (e.target === barRef.current) onAddStop(positionFromClientX(e.clientX));
      }}
    >
      {stops.map((s) => (
        <button
          key={s.id}
          type="button"
          className={styles.stopHandle}
          style={{ left: `${s.position}%`, background: s.color }}
          aria-label={`Stop at ${s.position}% — drag to move`}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            draggingRef.current = s.id;
          }}
          onPointerMove={(e) => {
            if (draggingRef.current === s.id) onPositionChange(s.id, positionFromClientX(e.clientX));
          }}
          onPointerUp={(e) => {
            draggingRef.current = null;
            e.currentTarget.releasePointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') onPositionChange(s.id, Math.max(0, s.position - 1));
            if (e.key === 'ArrowRight') onPositionChange(s.id, Math.min(100, s.position + 1));
          }}
        />
      ))}
    </div>
  );
}

/** Angle control — a slider (0–360°) with a right-aligned degree readout. */
function AngleSlider({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.sliderHead}>
        <span className={styles.fieldLabel}>Angle</span>
        <span className={styles.sliderValue}>{Math.round(value)}&deg;</span>
      </div>
      <Slider
        value={value}
        min={0}
        max={360}
        step={1}
        knobStyle="inside"
        showTooltip={false}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export function newGradient(index: number): GradientDef {
  return {
    id: makeId('gradient'),
    name: `Gradient ${index}`,
    type: 'linear',
    angle: 90,
    centerX: 50,
    centerY: 50,
    size: 'farthest-corner',
    shape: 'ellipse',
    stops: [
      { id: makeId('stop'), color: '#7C3AED', position: 0, opacity: 100 },
      { id: makeId('stop'), color: '#EC4899', position: 100, opacity: 100 },
    ],
    onColor: '#FFFFFF',
  };
}

export interface GradientsEditSheetProps {
  gradients: GradientDef[];
  onChange: (next: GradientDef[]) => void;
  colorScales: GradientColorScale[];
}

export function GradientsEditSheet({ gradients, onChange, colorScales }: GradientsEditSheetProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const patchGradient = useCallback(
    (id: string, patch: Partial<GradientDef>) => {
      onChange(gradients.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    },
    [gradients, onChange],
  );

  const removeGradient = useCallback(
    (id: string) => onChange(gradients.filter((g) => g.id !== id)),
    [gradients, onChange],
  );

  const addGradient = useCallback(
    () => onChange([...gradients, newGradient(gradients.length + 1)]),
    [gradients, onChange],
  );

  const patchStop = useCallback(
    (gradientId: string, stopId: string, patch: Partial<GradientStop>) => {
      const g = gradients.find((x) => x.id === gradientId);
      if (!g) return;
      patchGradient(gradientId, {
        stops: g.stops.map((s) => (s.id === stopId ? { ...s, ...patch } : s)),
      });
    },
    [gradients, patchGradient],
  );

  const addStop = useCallback(
    (gradientId: string, position?: number) => {
      const g = gradients.find((x) => x.id === gradientId);
      if (!g) return;
      const pos = position ?? 50;
      patchGradient(gradientId, {
        stops: [
          ...g.stops,
          { id: makeId('stop'), color: colorAtPosition(g.stops, pos), position: pos, opacity: 100 },
        ],
      });
    },
    [gradients, patchGradient],
  );

  const removeStop = useCallback(
    (gradientId: string, stopId: string) => {
      const g = gradients.find((x) => x.id === gradientId);
      if (!g || g.stops.length <= 2) return; // keep a minimum of 2 stops
      patchGradient(gradientId, { stops: g.stops.filter((s) => s.id !== stopId) });
    },
    [gradients, patchGradient],
  );

  return (
    <>
      {gradients.map((g) => {
        // Rows always render start→end so an added stop lands in colour order.
        const orderedStops = [...g.stops].sort((a, b) => a.position - b.position);
        return (
          <section key={g.id} className={styles.gradientCard}>
            {/* Header — name + rename pencil */}
            <div className={styles.cardHeader}>
              {renamingId === g.id ? (
                <div className={styles.nameInput}>
                  <Input
                    value={g.name}
                    onChange={(v) => patchGradient(g.id, { name: v })}
                    aria-label="Gradient name"
                    size="s"
                  />
                </div>
              ) : (
                <h3 className={styles.cardTitle}>{g.name}</h3>
              )}
              <IconButton
                icon="edit"
                attention="low"
                contained
                size="s"
                onPress={() => setRenamingId((cur) => (cur === g.id ? null : g.id))}
                aria-label={`Rename ${g.name}`}
              />
            </div>

            {/* Type */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Type</span>
              <ChipGroup
                value={[g.type]}
                required
                onValueChange={(v) => {
                  const next = v[0] as GradientType | undefined;
                  if (next) patchGradient(g.id, { type: next });
                }}
              >
                {TYPE_OPTIONS.map((t) => (
                  <Chip key={t.value} value={t.value}>
                    {t.label}
                  </Chip>
                ))}
              </ChipGroup>
            </div>

            {/* Geometry — type dependent */}
            {g.type === 'linear' && (
              <AngleSlider
                value={g.angle ?? 90}
                onChange={(v) => patchGradient(g.id, { angle: v })}
                ariaLabel="Gradient angle"
              />
            )}

            {g.type === 'radial' && (
              <>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Geometry</span>
                  <ChipGroup
                    value={[g.shape ?? 'ellipse']}
                    required
                    onValueChange={(v) => {
                      const next = v[0] as RadialShape | undefined;
                      if (next) patchGradient(g.id, { shape: next });
                    }}
                  >
                    {SHAPE_OPTIONS.map((s) => (
                      <Chip key={s.value} value={s.value}>
                        {s.label}
                      </Chip>
                    ))}
                  </ChipGroup>
                </div>
                <div className={styles.geometryGrid}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Centre X</span>
                    <Input
                      value={String(g.centerX ?? 50)}
                      onChange={(v) => patchGradient(g.id, { centerX: toNum(v, g.centerX ?? 50) })}
                      aria-label="Centre X percent"
                      size="s"
                      end2="%"
                    />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Centre Y</span>
                    <Input
                      value={String(g.centerY ?? 50)}
                      onChange={(v) => patchGradient(g.id, { centerY: toNum(v, g.centerY ?? 50) })}
                      aria-label="Centre Y percent"
                      size="s"
                      end2="%"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Size</span>
                  <Select
                    value={g.size ?? 'farthest-corner'}
                    onChange={(v) => patchGradient(g.id, { size: v })}
                    options={SIZE_OPTIONS}
                    size="sm"
                    aria-label="Radial size"
                  />
                </div>
              </>
            )}

            {g.type === 'conic' && (
              <>
                <AngleSlider
                  value={g.angle ?? 0}
                  onChange={(v) => patchGradient(g.id, { angle: v })}
                  ariaLabel="Conic start angle"
                />
                <div className={styles.geometryGrid}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Centre X</span>
                    <Input
                      value={String(g.centerX ?? 50)}
                      onChange={(v) => patchGradient(g.id, { centerX: toNum(v, g.centerX ?? 50) })}
                      aria-label="Centre X percent"
                      size="s"
                      end2="%"
                    />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Centre Y</span>
                    <Input
                      value={String(g.centerY ?? 50)}
                      onChange={(v) => patchGradient(g.id, { centerY: toNum(v, g.centerY ?? 50) })}
                      aria-label="Centre Y percent"
                      size="s"
                      end2="%"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Stops */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Stops</span>
              <GradientStopsBar
                stops={g.stops}
                onPositionChange={(stopId, position) => patchStop(g.id, stopId, { position })}
                onAddStop={(position) => addStop(g.id, position)}
              />
              <div className={styles.stopList}>
                {orderedStops.map((stop) => (
                  <div key={stop.id} className={styles.stopRow}>
                    <Input
                      value={String(stop.position)}
                      onChange={(v) => patchStop(g.id, stop.id, { position: toNum(v, stop.position) })}
                      aria-label="Stop position percent"
                      size="s"
                      end2="%"
                    />
                    <BrandColorField
                      value={stop.color}
                      onChange={(v) => patchStop(g.id, stop.id, { color: v })}
                      colorScales={colorScales}
                      ariaLabel="Stop colour"
                    />
                    <Input
                      value={String(stop.opacity ?? 100)}
                      onChange={(v) => patchStop(g.id, stop.id, { opacity: toNum(v, stop.opacity ?? 100) })}
                      aria-label="Stop opacity percent"
                      size="s"
                      end2="%"
                    />
                    <IconButton
                      icon="IcTrashClear"
                      attention="low"
                      contained
                      size="s"
                      onPress={() => removeStop(g.id, stop.id)}
                      disabled={g.stops.length <= 2}
                      aria-label="Remove stop"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* On colour */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>On colour</span>
              <BrandColorField
                value={g.onColor}
                onChange={(v) => patchGradient(g.id, { onColor: v })}
                colorScales={colorScales}
                ariaLabel="On colour"
              />
            </div>

            {/* Remove gradient — negative, inside the card */}
            <Button
              className={styles.removeGradientButton}
              appearance="negative"
              attention="low"
              size="small"
              start={<Icon icon="IcTrashClear" emphasis="tintedA11y" />}
              onPress={() => removeGradient(g.id)}
            >
              Remove gradient
            </Button>
          </section>
        );
      })}

      <Button
        className={styles.addGradientButton}
        appearance="primary"
        attention="low"
        size="small"
        start={<Icon icon="add" emphasis="tintedA11y" />}
        onPress={addGradient}
      >
        Add gradient
      </Button>
    </>
  );
}
