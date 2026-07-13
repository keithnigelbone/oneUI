import { Navigate, useParams } from 'react-router-dom';
import { getMetaBySlug } from '@/catalog/registry';
import { storybookPlaygroundPath } from '../qaStorybookNav';
import { QaStorybookComponentPlayground } from '../QaStorybookComponentPlayground';

export function QaStorybookComponentPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const meta = getMetaBySlug(slug);

  if (!meta) {
    return <Navigate to={storybookPlaygroundPath()} replace />;
  }

  return <QaStorybookComponentPlayground key={meta.slug} meta={meta} />;
}
