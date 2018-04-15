interface ilog {
  readonly level: number;
  readonly levels: string[];
  (message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  setLevel(level: string | number): void;
  emerg(error?: any): void;
  alert(error?: any): void;
  crit(error?: any): void;
  err(error?: any): void;
  error(error?: any): void;
  warning(error?: any): void;
  notice(message: any): void;
  info(message: any): void;
  debug(message: any, ...optionalParams: any[]): void;
  auto(message: any, ...optionalParams: any[]): void;
  _time(time: Date): string;
  _stringify(obj: any): string;
  _assembleLog(log: string, level: string, time: string): string;
}

declare const ilog: ilog;
export = ilog;
