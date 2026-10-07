// Derivación CC BY 4.0: SEMOVI CDMX → RAR → KMZ → KML → GeoJSON XY.
import { readFile, writeFile, mkdtemp, readdir, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { DOMParser } from '@xmldom/xmldom';
const root = 'docs/investigacion/ruta1/recursos-abiertos';
const raw = `${root}/semovi-rutas-consulta-2026-10-06.rar`;
const original = await readFile(raw);
const sha256 = createHash('sha256').update(original).digest('hex');
const register = JSON.parse(await readFile('docs/investigacion/ruta1/fuentes-documento-maestro.json', 'utf8'));
const reference = register.fuentes.find(f => f.id === 'M09');
const registeredHashes = JSON.stringify(reference);
if (!registeredHashes.includes(sha256)) throw new Error('El checksum original no coincide con M09.');
const temporary = await mkdtemp(join(tmpdir(), 'hackelectro-geometria-'));
const distance = (line) => line.slice(1).reduce((sum, b, i) => {
 const a = line[i]; const rad = n => n * Math.PI / 180;
 const h = Math.sin(rad(b[1]-a[1])/2)**2 + Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(rad(b[0]-a[0])/2)**2;
 return sum + 2*6371008.8*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
}, 0);
try {
 execFileSync('7z', ['x', raw, `-o${temporary}`, '-y'], {stdio:'pipe'});
 const find = async (dir, suffix) => {for (const file of await readdir(dir, {withFileTypes:true})) {const p=join(dir,file.name); if(file.isDirectory()){const match=await find(p,suffix);if(match)return match;}else if(file.name.endsWith(suffix))return p;}};
 const kmz = await find(temporary, '.kmz');
 if(!kmz) throw new Error('KMZ no localizado');
 const xml = execFileSync('7z', ['e', kmz, 'doc.kml', '-so'], {maxBuffer:30_000_000}).toString();
 const doc = new DOMParser({onError: (level, message) => {if(level==='fatalError')throw new Error(message);}}).parseFromString(xml, 'application/xml');
 const features=[]; const records=[];
 for(const [index, place] of Array.from(doc.getElementsByTagName('Placemark')).entries()) {
  const properties = Object.fromEntries(Array.from(place.getElementsByTagName('Data')).map(d=>[d.getAttribute('name'), d.getElementsByTagName('value')[0]?.textContent?.trim()??'']));
  const id = `M09-${place.getAttribute('id') || index}`;
  const lines=Array.from(place.getElementsByTagName('LineString')).map((line, i)=>{
   const coordinates=line.getElementsByTagName('coordinates')[0]?.textContent?.trim().split(/\s+/).map(t=>t.split(',').slice(0,2).map(Number))??[];
   if(coordinates.some(c=>c.length!==2||!c.every(Number.isFinite)))throw new Error(`Coordenadas inválidas: ${id}`);
   const lengthM=distance(coordinates);
   return {type:'Feature',id:`${id}-${i+1}`,properties:{...properties,recordId:id,lengthM,sourceId:'M09',technology:'unknown',internalDate:'2022-09-02'},geometry:{type:'LineString',coordinates}};
  }).filter(line=>line.geometry.coordinates.length>1);
  if(!lines.length) continue;
  records.push({id,route:properties.RUTA??'',name:properties.RAMAL??place.getElementsByTagName('name')[0]?.textContent??id,detail:properties.DETALLE??'',cycleKm:lines.reduce((n,l)=>n+l.properties.lengthM,0)/1000,featureIds:lines.map(l=>l.id),technology:'unknown',sourceId:'M09',internalDate:'2022-09-02'});
  features.push(...lines);
 }
 if(records.length!==995) throw new Error(`Se esperaban 995 registros: ${records.length}`);
 const target=records.find(r=>r.route==='1'&&r.name==='METRO CU - SAN FERNANDO HUIPULCO');
 if(!target||Math.abs(target.cycleKm-20.340012617)>0.000001)throw new Error('Derivación Ruta 1 no coincide');
 await mkdir('public/data',{recursive:true});
 await writeFile('public/data/routes.geojson',JSON.stringify({type:'FeatureCollection',features}));
 await writeFile('public/data/routes.json',JSON.stringify(records));
 const manifest={sourceId:'M09',sourceUrl:'https://datos.cdmx.gob.mx/dataset/ubicacion-de-rutas-del-transporte-publico-concesionado-de-ruta',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',attribution:'SEMOVI, Gobierno de la Ciudad de México',consulted:'2026-10-06',internalDate:'2022-09-02',sourceSha256:sha256,records:records.length,features:features.length,method:'KML LineStrings independientes → XY sin Z → Haversine R=6371008.8 m; sin unir extremos ni simplificar.',limitations:'Archivo histórico. No acredita operación, tecnología, demanda, topografía ni ciclo vigente.'};
 await writeFile('public/data/routes-manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(`${records.length} registros, ${features.length} trazos; Ruta 1 ${target.cycleKm.toFixed(9)} km. Original intacto: ${sha256}`);
} finally {await rm(temporary,{recursive:true,force:true});}
