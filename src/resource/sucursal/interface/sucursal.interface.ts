import { IEmpresa } from "src/resource/empresa/interface/empresa.interface";

export interface ISucursal {
    id?: number;
    name: string;
    codigo_sucursal: string;
    direccion: string;
    empresa?: IEmpresa;
}