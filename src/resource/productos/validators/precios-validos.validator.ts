import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class PrecioVentaMayorQueCosto implements ValidatorConstraintInterface {
    //basicamente valida que el precio de venta sea mayor o igual al precio de costo
    validate(precio_venta: number, args: ValidationArguments) {
        const obj = args.object as any;
        return typeof precio_venta === 'number' &&
            typeof obj.precio_costo === 'number' &&
            precio_venta >= obj.precio_costo;
    }

    defaultMessage(args: ValidationArguments) {
        return 'El precio de venta debe ser mayor o igual al precio de costo';
    }
}
