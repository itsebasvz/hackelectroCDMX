import {ScenarioSchema,type Scenario} from '../domain/schema';
import {catalog,assumed} from './catalog';
export function defaultScenario():Scenario {
 const base={schemaVersion:'1',modelVersion:'1.0.0',name:'Ruta 1 · transición justa exploratoria',route:{id:'M09-514',name:'METRO CU - SAN FERNANDO HUIPULCO',cycleKm:20.340012617007122,sourceId:'M09',internalDate:'2022-09-02'},operation:{fleet:3,cycles:8,cycleMinutes:90,serviceHours:13,emptyRatio:.05,emptySpeedKmh:20,days:26,requiredCapacity:15,maxHeadwayMinutes:30,boardings:320,fare:10,operators:2,maxShiftHours:8,handlingHours:.5},energy:{efficiency:.9,soh:.9,socMin:.15,socMax:.9,chargeHours:8,siteKw:30,otherSiteKw:5,taperSoc:.8,taperFactor:.5,electricityPrice:4,demandPrice:150,fixedElectricity:1000,fuelPrice:23.68,gridFactor:.444},economy:{laborCost:18000,incomeGoal:15000,ownerGoal:5000,adminMonth:1000,depotMonth:5000,siteBase:80000,sitePerCharger:20000,initialReserve:60000,monthlyReserve:1000,ownCapital:900000,support:0,residualFraction:0,batteryReplacementMonth:0,batteryReplacementCost:0},ice:catalog.vehicles[0],ev:catalog.vehicles[1],charger:catalog.chargers[0],chargerCount:3,finance:catalog.finances[2],evidence:{},catalog};
 const s=ScenarioSchema.parse(base);
 for(const group of ['operation','energy','economy'] as const)for(const key of Object.keys(s[group]))s.evidence[`${group}.${key}`]=assumed();
 s.evidence['route.cycleKm']={sourceId:'M09',nature:'derivado',level:'A',date:'2022-09-02; consulta 2026-10-06',scope:'Ramal histórico',limitation:'Suma de dos trazos cartográficos; no ciclo operativo actual. Sin Z ni cierre artificial.'};
 s.evidence['energy.fuelPrice']={sourceId:'M23',nature:'oficial',level:'D',date:'2026-08-27',scope:'México nacional',limitation:'Referencia PROFECO; no comprobante del ramal.'};
 s.evidence['energy.gridFactor']={sourceId:'M15',nature:'oficial',level:'D',date:'2024; aviso 2026-05-29',scope:'SEN México',limitation:'Factor histórico 2024, no red medida 2026 ni ciclo de vida.'};
 return s;
}
export function preset(s:Scenario,category:'van'|'minibus'|'urban'):Scenario {
 const next=structuredClone(s);
 const ice=next.catalog.vehicles.find(v=>v.category===category&&v.fuel!=='electricidad');
 const ev=next.catalog.vehicles.find(v=>v.category===category&&v.fuel==='electricidad');
 if(!ice||!ev)return next;
 next.ice=ice;next.ev=ev;next.operation.requiredCapacity=Math.min(ice.capacity,ev.capacity);
 next.energy.fuelPrice=ice.fuel==='diesel'?27:23.68;
 next.evidence['energy.fuelPrice']={sourceId:ice.fuel==='diesel'?'M24':'M23',nature:'oficial',level:'D',date:ice.fuel==='diesel'?'2026-09-25':'2026-08-27',scope:'México nacional',limitation:'Promedio nacional; no precio local.'};
 next.charger=next.catalog.chargers.find(c=>c.id===(category==='van'?'ac7':'dc60'))!;
 next.chargerCount=category==='van'?3:1;
 next.energy.siteKw=category==='van'?30:70;
 return ScenarioSchema.parse(next);
}
