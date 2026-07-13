import { useValue } from '@tldraw/state-react'
import { X } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@oneui/convex'
import type { Id } from '@oneui/convex/_generated/dataModel'
import { Select, type SelectOption } from '@oneui/ui/components/Select'
import { getBrandAtom, setBrandId, setMode, setSubBrandId } from '@/theme/brandStore'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Brand selection panel. Replaces the old 5-preset / --ui-* token editor with
 * live brand + sub-brand + light/dark selection sourced from Convex. Tokens are
 * injected globally by BrandInjector, so the whole app re-themes on change.
 */
export function ThemePanel({ open, onClose }: Props) {
  const sel = useValue('brand selection', () => getBrandAtom().get(), [])
  const brands = useQuery(api.brands.list)
  const subBrands = useQuery(
    api.subBrandConfigs.getByParentBrand,
    sel.brandId ? { parentBrandId: sel.brandId as Id<'brands'> } : 'skip',
  )

  if (!open) return null

  const brandOptions: SelectOption[] = brands?.length
    ? brands.map((b) => ({ value: b._id, label: b.name }))
    : [{ value: '', label: 'Loading…', disabled: true }]

  const subBrandOptions: SelectOption[] = [
    { value: '', label: 'Base brand' },
    ...(subBrands ?? []).map((s) => ({ value: s._id, label: s.name })),
  ]

  const modeOptions: SelectOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white w-full max-w-md rounded-xl border border-[#ebebeb] shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebebeb]">
          <div className="text-base font-semibold text-zinc-900">Brand &amp; theme</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded text-zinc-500 hover:text-zinc-900 hover:bg-[#f5f5f5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Row label="Brand">
            <Select
              aria-label="Brand"
              value={sel.brandId}
              onChange={(v) => setBrandId(v)}
              options={brandOptions}
              placeholder="Select a brand"
            />
          </Row>

          <Row label="Sub-brand">
            <Select
              aria-label="Sub-brand"
              value={sel.subBrandId}
              onChange={(v) => setSubBrandId(v)}
              options={subBrandOptions}
            />
          </Row>

          <Row label="Mode">
            <Select
              aria-label="Mode"
              value={sel.mode}
              onChange={(v) => setMode(v as 'light' | 'dark')}
              options={modeOptions}
            />
          </Row>
        </div>

        <div className="border-t border-[#ebebeb] px-4 py-2 text-[11px] text-zinc-500">
          Brand foundations load live from One UI. The selection is remembered in this browser.
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  )
}
