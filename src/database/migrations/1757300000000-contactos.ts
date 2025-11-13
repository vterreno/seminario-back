import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Contactos1757300000000 implements MigrationInterface {
    name = 'Contactos1757300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla contactos
        await queryRunner.createTable(
            new Table({
                name: "contactos",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "nombre_razon_social",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "tipo_identificacion",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "numero_identificacion",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "condicion_iva",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "telefono_movil",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "direccion_calle",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "direccion_numero",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "direccion_piso_dpto",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "ciudad",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "provincia",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "codigo_postal",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true,
                        isNullable: false
                    },
                    {
                        name: "rol",
                        type: "varchar",
                        default: "'cliente'",
                        isNullable: false
                    },
                    {
                        name: "es_consumidor_final",
                        type: "boolean",
                        default: false,
                        isNullable: false
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Agregar foreign key
        await queryRunner.createForeignKey(
            "contactos",
            new TableForeignKey({
                name: "FK_contactos_empresa",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Crear índice único condicional (partial index)
        // NOTA: Los índices parciales con WHERE no están completamente soportados en Query Builder
        // Por lo tanto, mantenemos el SQL puro para este caso específico
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_contactos_identificacion" 
            ON "contactos" ("empresa_id", "tipo_identificacion", "numero_identificacion") 
            WHERE "tipo_identificacion" IS NOT NULL AND "numero_identificacion" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índice único
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_contactos_identificacion"`);
        
        // Eliminar foreign key
        await queryRunner.dropForeignKey("contactos", "FK_contactos_empresa");
        
        // Eliminar tabla
        await queryRunner.dropTable("contactos");
    }
}