import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

async function main() {
  const c = new ConvexHttpClient('https://robust-stoat-734.convex.cloud');
  const all = await c.query(api.subBrandConfigs.listAll, {});
  console.log('Total sub-brands:', all.length);
  for (const sb of all) {
    console.log(`  parent=${sb.parentBrandId}  slug=${sb.slug ?? '(none)'}  name=${sb.name}  id=${sb._id}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
