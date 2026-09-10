export const I18N_VERSION='1.0';
export const SUPPORTED_LOCALES=Object.freeze({en:{label:'English',native:'English'},de:{label:'German',native:'Deutsch'},it:{label:'Italian',native:'Italiano'},fr:{label:'French',native:'Français'},es:{label:'Spanish',native:'Español'},pt:{label:'Portuguese',native:'Português'},uk:{label:'Ukrainian',native:'Українська'},pl:{label:'Polish',native:'Polski'},tr:{label:'Turkish',native:'Türkçe'},ja:{label:'Japanese',native:'日本語'},ko:{label:'Korean',native:'한국어'},zh:{label:'Chinese',native:'中文'}});
const T={
'Command Center':{de:'Kommandozentrale',it:'Command Center',fr:'Centre de commandement',es:'Centro de mando',pt:'Centro de comando',uk:'Центр керування',pl:'Centrum dowodzenia',tr:'Komuta Merkezi',ja:'コマンドセンター',ko:'커맨드 센터',zh:'指挥中心'},
'Cases':{de:'Fälle',it:'Casi',fr:'Dossiers',es:'Casos',pt:'Casos',uk:'Справи',pl:'Sprawy',tr:'Vakalar',ja:'ケース',ko:'사례',zh:'案件'},
'Evidence':{de:'Beweise',it:'Prove',fr:'Preuves',es:'Evidencias',pt:'Evidências',uk:'Докази',pl:'Dowody',tr:'Kanıtlar',ja:'証拠',ko:'증거',zh:'证据'},
'Entities & Graph':{de:'Entitäten & Graph',it:'Entità & Grafo',fr:'Entités & Graphe',es:'Entidades y grafo',pt:'Entidades e grafo',uk:'Сутності та граф',pl:'Encje i graf',tr:'Varlıklar ve grafik',ja:'エンティティとグラフ',ko:'엔터티 및 그래프',zh:'实体与图'},
'Hypotheses':{de:'Hypothesen',it:'Ipotesi',fr:'Hypothèses',es:'Hipótesis',pt:'Hipóteses',uk:'Гіпотези',pl:'Hipotezy',tr:'Hipotezler',ja:'仮説',ko:'가설',zh:'假设'},
'Contradictions':{de:'Widersprüche',it:'Contraddizioni',fr:'Contradictions',es:'Contradicciones',pt:'Contradições',uk:'Суперечності',pl:'Sprzeczności',tr:'Çelişkiler',ja:'矛盾',ko:'모순',zh:'矛盾'},
'Reports':{de:'Berichte',it:'Report',fr:'Rapports',es:'Informes',pt:'Relatórios',uk:'Звіти',pl:'Raporty',tr:'Raporlar',ja:'レポート',ko:'보고서',zh:'报告'},
'Governance':{de:'Governance',it:'Governance',fr:'Gouvernance',es:'Gobernanza',pt:'Governança',uk:'Управління',pl:'Zarządzanie',tr:'Yönetişim',ja:'ガバナンス',ko:'거버넌스',zh:'治理'},
'Search':{de:'Suchen',it:'Cerca',fr:'Rechercher',es:'Buscar',pt:'Pesquisar',uk:'Пошук',pl:'Szukaj',tr:'Ara',ja:'検索',ko:'검색',zh:'搜索'},
'Create first investigation':{de:'Erste Untersuchung erstellen',it:'Crea la prima indagine',fr:'Créer la première enquête',es:'Crear la primera investigación',pt:'Criar a primeira investigação',uk:'Створити перше розслідування',pl:'Utwórz pierwsze dochodzenie',tr:'İlk soruşturmayı oluştur',ja:'最初の調査を作成',ko:'첫 조사 만들기',zh:'创建第一项调查'}
};
const KEY='occ.locale';
export function supportedLocales(){return Object.keys(SUPPORTED_LOCALES);}
export function getLocale(storage=globalThis.localStorage){
 try{const saved=storage?.getItem(KEY);if(saved&&SUPPORTED_LOCALES[saved])return saved;}catch{}
 const browser=typeof navigator!=='undefined'?(navigator.language||'').toLowerCase().split('-')[0]:'';
 return SUPPORTED_LOCALES[browser]?browser:'en';
}
export function translate(value,locale=getLocale()){
 const text=String(value??''); if(locale==='en')return text;
 return T[text]?.[locale]||text;
}
export function setLocale(locale,storage=globalThis.localStorage){if(!SUPPORTED_LOCALES[locale])throw new Error(`Unsupported locale: ${locale}`);try{storage?.setItem(KEY,locale);}catch{};if(typeof document!=='undefined'){document.documentElement.lang=locale;document.dispatchEvent(new CustomEvent('occ:locale',{detail:{locale}}));}return locale;}
function installSelector(){if(typeof document==='undefined'||document.getElementById('localeSelect'))return;const host=document.querySelector('.status');if(!host)return;const wrap=document.createElement('label');wrap.id='languageControl';wrap.style.cssText='margin-left:8px;display:inline-flex;align-items:center;gap:5px';const select=document.createElement('select');select.id='localeSelect';select.setAttribute('aria-label','Interface language');select.style.cssText='background:#071318;color:inherit;border:1px solid #1a333b;border-radius:6px;padding:3px 6px;font-size:10px';for(const code of supportedLocales()){const o=document.createElement('option');o.value=code;o.textContent=`${SUPPORTED_LOCALES[code].native} · ${code.toUpperCase()}`;select.appendChild(o);}select.value=getLocale();select.addEventListener('change',()=>setLocale(select.value));wrap.appendChild(select);host.appendChild(wrap);}
const originalText=new WeakMap();
function translateDom(){if(typeof document==='undefined')return;const locale=getLocale();document.documentElement.lang=locale;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement?.closest('#localeSelect'))continue;const raw=originalText.has(node)?originalText.get(node):node.nodeValue;originalText.set(node,raw);const trimmed=String(raw).trim();if(!trimmed)continue;const translated=translate(trimmed,locale);if(translated!==trimmed){const lead=String(raw).match(/^\s*/)?.[0]||'',trail=String(raw).match(/\s*$/)?.[0]||'';node.nodeValue=lead+translated+trail;}else if(locale==='en'&&raw!==node.nodeValue)node.nodeValue=raw;}}
function boot(){installSelector();translateDom();document.addEventListener('occ:locale',()=>{installSelector();translateDom()});const observer=new MutationObserver(()=>{installSelector();translateDom()});observer.observe(document.body,{childList:true,subtree:true});}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
