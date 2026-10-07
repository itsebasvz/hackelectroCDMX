import type { Scenario, ChargeResult } from './schema';
/** Entrada/salida del medidor: curva explícita, carga por lotes, sin energía gratuita. */
export function charging(s:Scenario, batteryEnergy:number):ChargeResult {
 const {fleet}=s.operation; const e=s.energy; const capacity=s.ev.batteryKwh*e.soh;
 const availableKw=Math.max(0,e.siteKw-e.otherSiteKw);
 const count=Math.min(s.chargerCount,fleet);
 const endSoc=e.socMax-batteryEnergy/capacity;
 const beforeTaper=Math.max(0,Math.min(batteryEnergy,(e.taperSoc-endSoc)*capacity));
 const afterTaper=Math.max(0,batteryEnergy-beforeTaper);
 const timeline:{hour:number;kw:number}[]=[]; let hours=0; let perVehicleHours=0;
 const segments:{start:number;end:number;power:number}[]=[];
 for(let remaining=fleet;remaining>0;remaining-=count){
  const active=Math.min(count,remaining);
  const power=Math.min(s.ev.maxChargeKw,s.charger.powerKw,availableKw/active);
  if(power<=0)return {hours:Infinity,perVehicleHours:Infinity,peakKw:0,availableKw,gridKwhFleet:batteryEnergy/e.efficiency*fleet,batches:Math.ceil(fleet/count),timeline:[]};
  const t1=beforeTaper/(power*e.efficiency); const t2=afterTaper/(power*e.efficiency*e.taperFactor);
  if(t1>0)segments.push({start:hours,end:hours+t1,power:power*active});
  if(t2>0)segments.push({start:hours+t1,end:hours+t1+t2,power:power*active*e.taperFactor});
  perVehicleHours=Math.max(perVehicleHours,t1+t2);hours+=t1+t2;
 }
 let peakKw=0;
 for(let start=0;start<hours;start+=0.25){
  const energy=segments.reduce((sum,x)=>sum+Math.max(0,Math.min(start+.25,x.end)-Math.max(start,x.start))*x.power,0);
  const kw=energy/.25;peakKw=Math.max(peakKw,kw);timeline.push({hour:start,kw});
 }
 return {hours,perVehicleHours,peakKw,availableKw,gridKwhFleet:batteryEnergy/e.efficiency*fleet,batches:Math.ceil(fleet/count),timeline};
}
