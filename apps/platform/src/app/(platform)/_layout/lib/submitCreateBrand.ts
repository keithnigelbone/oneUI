import type { Id } from '@oneui/convex/_generated/dataModel';
import type { BrandFormData } from '@/design-tools/Brand/CreateBrand';

/**
 * Shape of the `api.brands.create` Convex mutation argument. Kept loose
 * (`unknown` return) so callers can pass whichever client binding they
 * already hold — both `useMutation(api.brands.create)` and a server-side
 * caller satisfy this signature.
 */
// fallow-ignore-next-line unused-types
export type CreateBrandMutation = (args: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  primaryHue: number;
  primaryChroma: number;
  secondaryHue: number;
  secondaryChroma: number;
  baseBrand?: Id<'brands'>;
  status: 'active' | 'draft' | 'deprecated';
}) => Promise<Id<'brands'>>;

/**
 * Shared mapping from CreateBrand dialog `BrandFormData` to the Convex
 * `brands.create` mutation. Used by the platform shell's brand-create
 * dialog (in layout.tsx) and the brand Overview page so both call sites
 * stay in lockstep on field shape and `status: 'active'` default.
 */
export async function submitCreateBrand(
  createBrand: CreateBrandMutation,
  formData: BrandFormData,
): Promise<Id<'brands'>> {
  return createBrand({
    name: formData.name,
    slug: formData.slug,
    description: formData.description || undefined,
    primaryHue: formData.primaryHue,
    primaryChroma: formData.primaryChroma,
    secondaryHue: formData.secondaryHue,
    secondaryChroma: formData.secondaryChroma,
    baseBrand: formData.baseBrand ? (formData.baseBrand as Id<'brands'>) : undefined,
    status: 'active',
  });
}
