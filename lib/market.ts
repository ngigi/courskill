export type Quote={symbol:string;bid:number;ask:number;change:number;timestamp:string};
export interface MarketProvider{quote(symbol:string):Promise<Quote>}
class DemoProvider implements MarketProvider{async quote(symbol:string){const base=symbol==='EURUSD'?1.0842:symbol==='GBPUSD'?1.2714:150.12;return{symbol,bid:base-0.0001,ask:base+0.0001,change:0.18,timestamp:new Date().toISOString()}}}
export function marketProvider():MarketProvider{return new DemoProvider()}
