/**
 * Figma plugin snippet (string) executed via figma-console's `figma_execute`.
 *
 * Why this exists: in OneUI Figma files, `appearance` and `surface` are NOT
 * component properties and NOT local variables — they are variable-collection
 * MODES (the Dev mode → Inspect "Modes" panel). The only reliable way to read
 * them is the Plugin API's `node.resolvedVariableModes` / `explicitVariableModes`,
 * resolving collection + mode names via `getVariableCollectionByIdAsync` (which
 * works for the remote library collections a node references, even when local /
 * library variable enumeration returns nothing).
 *
 * The snippet walks the target node's subtree and returns a NESTED hierarchy in
 * which every kept node carries its component prop values (`componentProperties`),
 * its effective `appearance` / `surface`, the visible text (`chars`), auto-layout
 * placement (`layout`: direction, gap/padding with the BOUND dimension-scale
 * variable so codegen can resolve to a spacing TOKEN instead of a literal px),
 * geometry (`w`/`h`, `sizeH`/`sizeV`), and — for any node — `cornerRadius` +
 * `absoluteBox` (used for the rare absolute case and for inferring row layout on
 * non-auto-layout tab bars).
 *
 * The exported function returns the code as a string with the rootId / limits
 * interpolated, ready to pass to `figma_execute({ code })`.
 */
export function buildModesSnippet(rootId: string, opts?: { maxNodes?: number; maxDepth?: number }): string {
  const maxNodes = opts?.maxNodes ?? 600;
  const maxDepth = opts?.maxDepth ?? 16;
  // NOTE: kept as a single template so it ships verbatim to the Figma plugin VM.
  return `
const ROOT_ID=${JSON.stringify(rootId)}, MAX_NODES=${maxNodes}, MAX_DEPTH=${maxDepth};
// Variable collections we care about (Dev-mode "Modes") -> normalized keys.
const KEY={'01 Appearance':'appearance','03 Surface':'surface','15 Brand':'brand','10 Colour mode':'colourMode','02 Accent':'accent','11 Density':'density'};
const collCache={};
async function coll(id){ if(!(id in collCache)){ try{collCache[id]=await figma.variables.getVariableCollectionByIdAsync(id);}catch(e){collCache[id]=null;} } return collCache[id]; }
async function keyModes(node,which){
  const src=node[which]||{}; const out={};
  for(const cid of Object.keys(src)){ const c=await coll(cid); if(!c||!(c.name in KEY))continue; const mn=(c.modes.find(m=>m.modeId===src[cid])||{}).name; out[KEY[c.name]]=mn; }
  return out;
}
function clean(k){ return k.split('#')[0].replace(/[\\u200B-\\u200D\\uFEFF\\u2068\\u2069\\u202A-\\u202E]/g,'').replace(/↳/g,'').trim(); }
function propVals(node){ const cp=node.componentProperties; if(!cp)return undefined; const o={}; for(const k of Object.keys(cp)){ const v=cp[k]; o[clean(k)]=(v&&typeof v==='object')?(('value'in v)?v.value:v.type):v; } return Object.keys(o).length?o:undefined; }
// True when the node (or a shallow descendant) paints with an IMAGE fill — used
// to flag nodes whose rendered pixels must be downloaded as an asset.
function hasImageFill(node){
  try{ const f=node.fills; if(Array.isArray(f)&&f.some(function(p){return p&&p.type==='IMAGE'&&p.visible!==false;})) return true; }catch(e){}
  return false;
}
const SKIP=new Set(['VECTOR','RECTANGLE','ELLIPSE','LINE','BOOLEAN_OPERATION','GROUP','STAR','POLYGON','SLICE']);
const varCache={};
async function varName(id){ if(!(id in varCache)){ try{const v=await figma.variables.getVariableByIdAsync(id);varCache[id]=v?v.name:undefined;}catch(e){varCache[id]=undefined;} } return varCache[id]; }
const styleCache={};
async function styleName(id){ if(!(id in styleCache)){ try{const s=await figma.getStyleByIdAsync(id);styleCache[id]=s?s.name:undefined;}catch(e){styleCache[id]=undefined;} } return styleCache[id]; }
// Auto-layout geometry + the dimension-scale variable bound to each spacing value
// (so codegen can resolve to a spacing TOKEN instead of a literal px), plus
// cornerRadius + absoluteBox captured for every kept node.
async function layoutInfo(node){
  const lm=node.layoutMode;
  const auto=lm&&lm!=='NONE';
  const bv=node.boundVariables||{};
  async function space(prop){
    const px=(typeof node[prop]==='number')?node[prop]:undefined;
    let token; const b=bv[prop]; if(b&&b.id){ token=await varName(b.id); }
    if(px===undefined&&token===undefined)return undefined;
    return {px:px,token:token};
  }
  const o={};
  if(auto){
    o.mode=lm;
    o.primaryAxisAlignItems=node.primaryAxisAlignItems;
    o.counterAxisAlignItems=node.counterAxisAlignItems;
    if(node.layoutWrap==='WRAP') o.wrap=true;
    o.itemSpacing=await space('itemSpacing');
    o.paddingTop=await space('paddingTop'); o.paddingRight=await space('paddingRight');
    o.paddingBottom=await space('paddingBottom'); o.paddingLeft=await space('paddingLeft');
  }
  if(typeof node.cornerRadius==='number'&&node.cornerRadius) o.cornerRadius=Math.round(node.cornerRadius);
  try{ const b=node.absoluteBoundingBox; if(b) o.absoluteBox={x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; }catch(e){}
  // Absolute overlay within an auto-layout parent (Figma "Ignore auto layout").
  // Capture the flag + pin constraints so codegen can re-pin the child by its own
  // constraints instead of sweeping it into the parent's flex flow; absoluteBox
  // (above) supplies the offsets. Constraints only matter for absolute children.
  if(node.layoutPositioning==='ABSOLUTE'){ o.absolute=true; try{ const c=node.constraints; if(c) o.constraints={horizontal:c.horizontal,vertical:c.vertical}; }catch(e){} }
  return Object.keys(o).length?o:undefined;
}
// Font properties for TEXT nodes so codegen can map a Text variant/size/weight
// (the refined tree otherwise drops all typography → flat hierarchy). Guard
// against figma.mixed (returned when a text node has multiple style runs).
async function typographyInfo(node){
  if(node.type!=='TEXT')return undefined;
  const o={};
  if(typeof node.fontSize==='number') o.fontSize=Math.round(node.fontSize);
  if(typeof node.fontWeight==='number') o.fontWeight=node.fontWeight;
  if(node.fontName&&typeof node.fontName==='object'){ o.fontFamily=node.fontName.family; o.fontStyle=node.fontName.style; }
  // AUTHORITATIVE variant/size: the bound text style name (e.g. "title/M",
  // "Headline-L", "label/S"). This beats px inference because a style's resolved
  // fontSize varies by theme/density mode (title/M is 16px under MyJio, 18 base).
  // Prefer the text-style name; fall back to the bound fontSize variable name
  // (e.g. "typography/fontSize/title-M") which also encodes variant+size.
  try{
    const sid=node.textStyleId;
    if(sid&&typeof sid==='string'){ const nm=await styleName(sid); if(nm) o.styleName=nm; }
    if(!o.styleName){ const bv=node.boundVariables&&node.boundVariables.fontSize; if(bv&&bv.id){ const nm=await varName(bv.id); if(nm) o.styleName=nm; } }
  }catch(e){}
  // Truncation → codegen maps to maxLines. ENDING = ellipsis clamp; an explicit
  // maxLines wins, otherwise a clamped single-line node defaults to 1.
  if(node.textTruncation==='ENDING') o.truncate=true;
  if(typeof node.maxLines==='number'&&node.maxLines>0) o.maxLines=node.maxLines;
  // Single-line detection: if the text box is only one line tall, it is meant to
  // stay on one line → codegen emits maxLines={1}. Many designs never set Figma's
  // textTruncation, so this geometry signal recovers the intended clamp. Multi-line
  // boxes (height >= ~2 lines) are left unclamped. lineHeight may be AUTO/%/px.
  try{
    var lh=node.lineHeight, fs=(typeof o.fontSize==='number')?o.fontSize:undefined, lhpx;
    if(lh&&lh.unit==='PIXELS') lhpx=lh.value;
    else if(lh&&lh.unit==='PERCENT'&&fs) lhpx=fs*lh.value/100;
    else if(fs) lhpx=fs*1.25;
    if(lhpx&&typeof node.height==='number'&&node.height<=lhpx*1.5) o.singleLine=true;
  }catch(e){}
  // Text fill opacity + bound colour-variable name → codegen maps low-emphasis
  // copy (reduced opacity or a "secondary" colour token) to attention="low".
  try{
    const f=node.fills;
    if(Array.isArray(f)){
      const solid=f.find(function(p){return p&&p.type==='SOLID'&&p.visible!==false;});
      if(solid){
        const nodeOp=(typeof node.opacity==='number')?node.opacity:1;
        const fillOp=(typeof solid.opacity==='number')?solid.opacity:1;
        o.fillOpacity=Math.round(nodeOp*fillOp*100)/100;
        const bv=solid.boundVariables&&solid.boundVariables.color;
        if(bv&&bv.id){ const nm=await varName(bv.id); if(nm) o.fillVar=nm; }
      }
    }
  }catch(e){}
  return Object.keys(o).length?o:undefined;
}
let count=0;
async function build(node,inherited,depth){
  if(count>=MAX_NODES||depth>MAX_DEPTH)return [];
  const expl=await keyModes(node,'explicitVariableModes');
  const eff=Object.assign({},inherited,expl);
  const isComp=node.type==='INSTANCE'||node.type==='COMPONENT';
  const hasOverride=Object.keys(expl).length>0;
  // Keep structural auto-layout frames so the hierarchy stays intact for layout.
  const hasAutoLayout=node.type==='FRAME'&&node.layoutMode&&node.layoutMode!=='NONE';
  // Keep visible TEXT nodes so their content survives to codegen (product names,
  // prices, headings, segmented-control labels). Without this, all text is dropped.
  const isText=node.type==='TEXT'&&typeof node.characters==='string'&&node.characters.trim().length>0;
  // Keep non-auto-layout frames too (so tab bars / absolutely-arranged groups
  // survive and their children's absoluteBox can drive row inference downstream).
  const isFrame=node.type==='FRAME'||node.type==='COMPONENT_SET';
  const keep=isComp||hasAutoLayout||isText||isFrame||(hasOverride&&!SKIP.has(node.type));
  let main=null;
  if(node.type==='INSTANCE'){ try{ const mc=await node.getMainComponentAsync(); if(mc){ main=(mc.parent&&mc.parent.type==='COMPONENT_SET')?mc.parent.name:mc.name; } }catch(e){} }
  let self=null;
  if(keep){ count++;
    self={ id:node.id, name:node.name, type:node.type, component:main||undefined,
      appearance:eff.appearance, surface:eff.surface,
      props:propVals(node), image:hasImageFill(node)||undefined,
      chars:isText?node.characters.trim():undefined,
      typography:isText?await typographyInfo(node):undefined,
      layout:await layoutInfo(node),
      w:(typeof node.width==='number')?Math.round(node.width):undefined,
      h:(typeof node.height==='number')?Math.round(node.height):undefined,
      sizeH:node.layoutSizingHorizontal, sizeV:node.layoutSizingVertical,
      modeOverrides:hasOverride?expl:undefined, children:[] };
  }
  const kids=('children'in node)?node.children:[];
  const bucket=self?self.children:[];
  for(const ch of kids){ const arr=await build(ch,eff,depth+1); for(const c of arr)bucket.push(c); }
  if(self){ if(self.children.length===0)delete self.children; return [self]; }
  return bucket;
}
const root=await figma.getNodeByIdAsync(ROOT_ID);
if(!root)return { error:'node_not_found', nodeId:ROOT_ID };
const base=await keyModes(root,'resolvedVariableModes');
const arr=await build(root,base,0);
return { rootId:ROOT_ID, base, nodeCount:count, truncated:count>=MAX_NODES, tree:arr[0]||null };
`.trim();
}
