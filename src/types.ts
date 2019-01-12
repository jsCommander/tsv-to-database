export type nodeCallback = (err?: Error, data?: any) => void;
export interface IParsedObject {
  [header: string]: string | number;
}
