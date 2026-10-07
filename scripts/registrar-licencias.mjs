import {readFile,writeFile,readdir,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
await mkdir('docs/desarrollo/licencias-dependencias',{recursive:true});
const entries=[];
for(const [path,p] of Object.entries(lock.packages)){
 if(!path||!p.version)continue;
 const names=await readdir(path).catch(()=>[]);
 const license=names.find(n=>/^(license|licence|copying|ofl)(\.|$)/i.test(n));
 const name=path.split('node_modules/').at(-1);
 const row={name,version:p.version,license:p.license??'UNKNOWN',dev:p.dev??false,integrity:p.integrity??null,text:null,sha256:null};
 if(license){const source=`${path}/${license}`;const data=await readFile(source);const local=`docs/desarrollo/licencias-dependencias/${name.replaceAll('/','__')}-${p.version}.txt`;await copyFile(source,local);row.text=local;row.sha256=createHash('sha256').update(data).digest('hex');}
 entries.push(row);
}
await writeFile('docs/desarrollo/dependencias.json',JSON.stringify({method:'Metadatos de package-lock.json y textos originales de paquetes instalados; no redactados por el equipo.',entries},null,2)+'\n');
console.log(`${entries.length} dependencias registradas; ${entries.filter(x=>x.text).length} textos originales. UNKNOWN: ${entries.filter(x=>x.license==='UNKNOWN').length}`);
