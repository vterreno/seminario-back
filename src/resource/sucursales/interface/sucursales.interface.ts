import { IEmpresa } from "src/resource/empresa/interface/empresa.interface";

export interface ISucursales {
    id?: number;
    nombre: string;
    codigo: string;
    direccion: string;
    estado: boolean;
    empresa_id?: number;
    empresa?: IEmpresa;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}