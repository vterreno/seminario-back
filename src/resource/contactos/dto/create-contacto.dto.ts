import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { CondicionIVA, ContactoRol, TipoIdentificacion } from 'src/database/core/contacto.entity';

export class CreateContactoDto {
  @IsString()
  @IsNotEmpty()
  nombre_razon_social: string;

  @IsOptional()
  @IsIn(['CUIT', 'DNI', 'CUIL', 'PASAPORTE', 'OTRO'])
  tipo_identificacion?: TipoIdentificacion;

  @ValidateIf(o => !!o.tipo_identificacion)
  @IsString()
  @IsNotEmpty({ message: 'El número de identificación es obligatorio cuando se selecciona un tipo' })
  numero_identificacion?: string;

  @IsOptional()
  @IsIn(['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final'])
  condicion_iva?: CondicionIVA;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono_movil?: string;

  @IsOptional()
  @IsString()
  direccion_calle?: string;

  @IsOptional()
  @IsString()
  direccion_numero?: string;

  @IsOptional()
  @IsString()
  direccion_piso_dpto?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  codigo_postal?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean = true;

  @IsOptional()
  @IsIn(['cliente', 'proveedor', 'ambos'])
  rol?: ContactoRol;

  @IsOptional()
  empresa_id?: number;
}


