import { z } from 'zod';
const n = z.number().finite().nonnegative();
const positive = z.number().finite().positive();
const fraction = n.max(1);
const text = z.string().min(1).max(500);
export const EvidenceSchema = z.object({sourceId:text,nature:z.enum(['oficial','comercial','derivado','supuesto','observado']),level:z.enum(['A','B','C','D','E','F']),date:text,scope:text,limitation:text});
export const VehicleSchema = z.object({
 id:text,name:text,category:z.enum(['van','minibus','urban']),fuel:z.enum(['gasolina','diesel','electricidad']),
 capacity:positive.int().max(200),advertisedCapacity:positive.int().max(200),price:n.max(100_000_000),
 batteryKwh:n.max(2000),maxChargeKw:n.max(2000),connector:z.enum(['unknown','AC2','CCS2','GBT']),
 includedChargerKw:n.max(2000),consumption:positive.max(100),maintenancePerKm:n.max(1000),insuranceMonth:n.max(1_000_000),
 lengthM:n.max(30),evidence:z.record(z.string(),EvidenceSchema),
}).superRefine((v,c)=>{if(v.fuel==='electricidad'&&(v.batteryKwh<=0||v.maxChargeKw<=0))c.addIssue({code:'custom',message:'Un BEV necesita batería y potencia positivas.'});});
export const ChargerSchema = z.object({id:text,name:text,powerKw:positive.max(2000),price:n.max(100_000_000),connector:z.enum(['unknown','AC2','CCS2','GBT']),evidence:z.record(z.string(),EvidenceSchema)});
export const FinanceSchema = z.object({id:text,name:text,kind:z.enum(['cash','credit','lease']),annualRate:fraction,months:positive.int().max(360),downPayment:fraction,commissionRate:fraction,financeInfrastructure:z.boolean(),leasePerUnitMonth:n.max(1_000_000),maintenanceIncluded:z.boolean(),evidence:z.record(z.string(),EvidenceSchema)});
export const SourceSchema = z.object({id:text,title:text,url:z.string().url(),date:text,scope:text,license:text,limitation:text});
export const CatalogSchema = z.object({version:z.literal('1'),date:text,vehicles:z.array(VehicleSchema).min(2).max(100),chargers:z.array(ChargerSchema).min(1).max(50),finances:z.array(FinanceSchema).min(1).max(50),sources:z.array(SourceSchema).max(500)});
export const ScenarioSchema = z.object({
 schemaVersion:z.literal('1'),modelVersion:z.literal('1.0.0'),name:text,
 route:z.object({id:text,name:text,cycleKm:positive.max(1000),sourceId:text,internalDate:text}),
 operation:z.object({fleet:positive.int().max(100),cycles:positive.int().max(100),cycleMinutes:positive.max(1440),serviceHours:positive.max(24),emptyRatio:fraction,emptySpeedKmh:positive.max(100),days:positive.int().max(31),requiredCapacity:positive.int().max(200),maxHeadwayMinutes:positive.max(1440),boardings:n.max(100_000),fare:n.max(1000),operators:positive.int().max(10),maxShiftHours:positive.max(12),handlingHours:n.max(12)}),
 energy:z.object({efficiency:positive.max(1),soh:positive.max(1),socMin:fraction,socMax:positive.max(1),chargeHours:positive.max(24),siteKw:n.max(100_000),otherSiteKw:n.max(100_000),taperSoc:fraction,taperFactor:positive.max(1),electricityPrice:n.max(1000),demandPrice:n.max(100_000),fixedElectricity:n.max(1_000_000),fuelPrice:positive.max(1000),gridFactor:n.max(100)}),
 economy:z.object({laborCost:n.max(1_000_000),incomeGoal:n.max(1_000_000),ownerGoal:n.max(1_000_000),adminMonth:n.max(1_000_000),depotMonth:n.max(100_000_000),siteBase:n.max(100_000_000),sitePerCharger:n.max(100_000_000),initialReserve:n.max(10_000_000),monthlyReserve:n.max(1_000_000),ownCapital:n.max(1_000_000_000),support:n.max(10_000_000_000),residualFraction:fraction,batteryReplacementMonth:n.int().max(60),batteryReplacementCost:n.max(100_000_000)}),
 ice:VehicleSchema,ev:VehicleSchema,charger:ChargerSchema,chargerCount:positive.int().max(100),finance:FinanceSchema,
 evidence:z.record(z.string(),EvidenceSchema),catalog:CatalogSchema,
}).superRefine((s,c)=>{
 if(s.energy.socMin>=s.energy.socMax)c.addIssue({code:'custom',path:['energy','socMin'],message:'El SOC mínimo debe ser menor al máximo.'});
 if(s.ice.fuel==='electricidad'||s.ev.fuel!=='electricidad')c.addIssue({code:'custom',path:['ice'],message:'Selecciona una referencia de combustión y una eléctrica.'});
 if(s.energy.chargeHours+s.operation.serviceHours>24)c.addIssue({code:'custom',path:['energy','chargeHours'],message:'Servicio y carga no pueden ocupar más de 24 horas.'});
 if(s.economy.batteryReplacementMonth===0&&s.economy.batteryReplacementCost>0)c.addIssue({code:'custom',path:['economy','batteryReplacementMonth'],message:'Indica el mes del reemplazo de batería.'});
});
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type Charger = z.infer<typeof ChargerSchema>;
export type Financing = z.infer<typeof FinanceSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type Source = z.infer<typeof SourceSchema>;
export interface RouteRecord {id:string;route:string;name:string;cycleKm:number;featureIds:string[];sourceId:string;internalDate:string;technology:'unknown'}
export interface Constraint {id:string;label:string;status:'pass'|'fail'|'pending';detail:string}
export interface Month {month:number;revenue:number;operating:number;workerCost:number;ownerIncome:number;payment:number;interest:number;principal:number;balance:number;reserve:number;freeCash:number;replacement:number}
export interface FinancialResult {capex:number;upfront:number;ownRequired:number;unappliedSupport:number;principal:number;payment:number;months:Month[];minMonthlyCash:number;operatingMonth:number;protectedMonth:number;economicCost:number;costPerKm:number;interestTotal:number;debtRemaining:number;reserveEnd:number;residual:number;support:number}
export interface ChargeResult {hours:number;peakKw:number;gridKwhFleet:number;perVehicleHours:number;availableKw:number;batches:number;timeline:{hour:number;kw:number}[]}
export interface Result {modelVersion:'1.0.0';scenario:Scenario;dailyKm:number;serviceKm:number;dailyLiters:number;dailyBatteryKwh:number;dailyGridKwh:number;usableKwh:number;socEnd:number;headway:number;workHours:number;charge:ChargeResult;ice:FinancialResult;ev:FinancialResult;constraints:Constraint[];passes:boolean;emissions:{iceCO2KgDay:number;evCO2eKgDay:number;comparable:false};warnings:string[];socTimeline:{hour:number;soc:number}[]}
export interface Alternative {scenario:Scenario;result:Result;support:number}
export interface SearchResult {alternatives:Alternative[];tested:number;rejected:Record<string,number>;limitExceeded:boolean;thresholds:{maxBatteryConsumption:number;minimumAverageSiteKw:number;monthlyOperatingGap:number}}
