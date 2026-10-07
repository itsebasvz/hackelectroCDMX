import type {Scenario,Result,SearchResult} from '../domain/schema';
export type Request={type:'evaluate'|'search';id:number;scenario:Scenario}|{type:'cancel';id:number};
export type Response={type:'evaluated';id:number;result:Result}|{type:'searched';id:number;result:SearchResult}|{type:'progress';id:number;tested:number;total:number}|{type:'error';id:number;error:string};
/** Una respuesta anterior nunca puede reemplazar el escenario más reciente. */
export class RequestGate {private current=0;next(){return ++this.current;}accepts(id:number){return id===this.current;}invalidate(){this.current++;}}
