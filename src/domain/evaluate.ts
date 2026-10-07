import {ScenarioSchema,type Scenario,type Result,type Constraint} from './schema';
import {charging} from './charging';
import {financial} from './finance';
export function evaluateScenario(input:Scenario):Result {
 const s=ScenarioSchema.parse(input);const o=s.operation;const e=s.energy;const ec=s.economy;
 const serviceKm=s.route.cycleKm*o.cycles; const dailyKm=serviceKm*(1+o.emptyRatio);
 const dailyLiters=dailyKm/s.ice.consumption;const dailyBatteryKwh=dailyKm*s.ev.consumption;
 const dailyGridKwh=dailyBatteryKwh/e.efficiency;
 const usableKwh=s.ev.batteryKwh*e.soh*(e.socMax-e.socMin);
 const socEnd=e.socMax-dailyBatteryKwh/(s.ev.batteryKwh*e.soh);
 const charge=charging(s,dailyBatteryKwh);
 const headway=o.cycleMinutes/o.fleet;
 const workHours=o.cycles*o.cycleMinutes/60+(dailyKm-serviceKm)/o.emptySpeedKmh+o.handlingHours;
 const shared=(ec.adminMonth*o.fleet+ec.depotMonth);
 const iceOperating=(dailyLiters*e.fuelPrice+dailyKm*s.ice.maintenancePerKm)*o.days*o.fleet+s.ice.insuranceMonth*o.fleet+shared;
 const maintenance=s.finance.kind==='lease'&&s.finance.maintenanceIncluded?0:s.ev.maintenancePerKm;
 const evOperating=(dailyGridKwh*e.electricityPrice+dailyKm*maintenance)*o.days*o.fleet+s.ev.insuranceMonth*o.fleet+shared+charge.peakKw*e.demandPrice+e.fixedElectricity;
 const ice=financial(s,s.ice,iceOperating,false);const ev=financial(s,s.ev,evOperating,true);
 const constraints:Constraint[]=[];
 const check=(id:string,label:string,pass:boolean,detail:string)=>constraints.push({id,label,status:pass?'pass':'fail',detail});
 check('capacity','Capacidad equivalente',s.ev.capacity>=o.requiredCapacity&&s.ice.capacity>=o.requiredCapacity,`Mínimo ${o.requiredCapacity}; combustión ${s.ice.capacity}; eléctrico ${s.ev.capacity} plazas efectivas de prueba.`);
 check('battery','Energía y reserva',dailyBatteryKwh<=usableKwh+1e-9,`${dailyBatteryKwh.toFixed(2)} kWh requeridos / ${usableKwh.toFixed(2)} kWh disponibles.`);
 check('charging','Recarga diaria de la flota',charge.hours<=e.chargeHours+1e-9,`${Number.isFinite(charge.hours)?charge.hours.toFixed(2):'Sin potencia'} h requeridas / ${e.chargeHours} h disponibles; ${charge.batches} lotes.`);
 check('schedule','Servicio y jornada',workHours<=o.serviceHours+1e-9&&workHours/o.operators<=o.maxShiftHours,`${workHours.toFixed(2)} h por unidad; ${(workHours/o.operators).toFixed(2)} h por operador, incluyendo maniobras y km adicionales.`);
 check('frequency','Frecuencia teórica protegida',headway<=o.maxHeadwayMinutes,`${headway.toFixed(1)} min teóricos / máximo ${o.maxHeadwayMinutes} min.`);
 const unknown=s.ev.connector==='unknown'||s.charger.connector==='unknown';
 check('connector','Conector',unknown||s.ev.connector===s.charger.connector,unknown?'Compatibilidad asumida; requiere confirmación de proveedor.':`${s.ev.connector} / ${s.charger.connector}.`);
 check('income','Presupuesto laboral',ec.laborCost>=ec.incomeGoal,`Costo presupuestado ${ec.laborCost} / ingreso objetivo ${ec.incomeGoal} MXN por persona. No valida salario neto ni prestaciones.`);
 check('initial','Capital inicial',ev.ownRequired<=ec.ownCapital,`${ev.ownRequired.toFixed(2)} MXN propios requeridos / ${ec.ownCapital.toFixed(2)} disponibles.`);
 check('monthly','Liquidez e ingreso protegido',ev.minMonthlyCash>=0,`Menor margen mensual ${ev.minMonthlyCash.toFixed(2)} MXN después de trabajo, ingreso del concesionario y reserva.`);
 for(const [id,label,detail] of [
  ['authorization','Autorización del arreglo','Permisos, concesión y participación de operadores por confirmar.'],
  ['site','Patio y conexión','Sitio, contrato y disponibilidad eléctrica no comprobados.'],
  ['access','Accesibilidad y disponibilidad','Configuración, homologación y entrega por confirmar.'],
  ['finance','Oferta financiera','Condiciones ilustrativas; no oferta aprobada.'],
 ] as const)constraints.push({id,label,status:'pending',detail});
 const factor=(s.ice.fuel==='diesel'?10.18:8.887)/3.785411784;
 const socTimeline=Array.from({length:o.cycles+1},(_,i)=>({hour:i*o.cycleMinutes/60,soc:e.socMax-(dailyBatteryKwh*i/o.cycles)/(s.ev.batteryKwh*e.soh)}));
 return {modelVersion:'1.0.0',scenario:s,dailyKm,serviceKm,dailyLiters,dailyBatteryKwh,dailyGridKwh,usableKwh,socEnd,headway,workHours,charge,ice,ev,constraints,passes:constraints.every(c=>c.status!=='fail'),emissions:{iceCO2KgDay:dailyLiters*factor,evCO2eKgDay:dailyGridKwh*e.gridFactor,comparable:false},socTimeline,warnings:[
  'Escenario ilustrativo. Geometría histórica y parámetros sustituibles; no operación actual medida.',
  'Cálculo agregado, sin tráfico, despacho, topografía ni aforo. Consumo neto incluye auxiliares y regeneración.',
  'Carga por lotes y curva hipotética; cargo de demanda estimado por intervalos de 15 minutos, no factura CFE.',
  'MXN constantes, residual y reemplazo según entradas; cinco años no acredita vida útil ni garantía.',
  'CO₂ de escape (EPA) y CO₂e eléctrico indirecto (SEN 2024) tienen límites diferentes; sin reducción neta ni ciclo de vida.',
  ...(unknown?['Conector y potencia de carga de la configuración deben comprobarse.']:[]),
  ...(ev.unappliedSupport>0?['Parte de la aportación excede la inversión y reserva; se informa como no aplicada.']:[]),
 ]};
}
