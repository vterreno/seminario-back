import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class AddEmpresaIdToUnidadesMedida1761600000000 implements MigrationInterface {
    name = 'AddEmpresaIdToUnidadesMedida1761600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna empresa_id ya existe
        const table = await queryRunner.getTable("unidades_medida");
        const columnExists = table?.columns.find(column => column.name === "empresa_id");

        if (!columnExists) {
            console.log('🔄 Agregando columna empresa_id a unidades_medida...');
            
            // Agregar la columna empresa_id
            await queryRunner.addColumn(
                "unidades_medida",
                new TableColumn({
                    name: "empresa_id",
                    type: "int",
                    isNullable: true
                })
            );

            // Agregar la constraint foreign key
            await queryRunner.createForeignKey(
                "unidades_medida",
                new TableForeignKey({
                    name: "FK_unidades_medida_empresa",
                    columnNames: ["empresa_id"],
                    referencedTableName: "empresa",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );

            // Crear índices únicos compuestos
            await queryRunner.createIndex(
                "unidades_medida",
                new TableIndex({
                    name: "IDX_unidades_medida_nombre_empresa",
                    columnNames: ["nombre", "empresa_id"],
                    isUnique: true
                })
            );

            await queryRunner.createIndex(
                "unidades_medida",
                new TableIndex({
                    name: "IDX_unidades_medida_abreviatura_empresa",
                    columnNames: ["abreviatura", "empresa_id"],
                    isUnique: true
                })
            );

            console.log('✅ Columna empresa_id agregada exitosamente a unidades_medida');
        } else {
            console.log('✅ La columna empresa_id ya existe en unidades_medida');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("unidades_medida");
        
        // Eliminar los índices primero
        const nombreEmpresaIndex = table?.indices.find(index => index.name === "IDX_unidades_medida_nombre_empresa");
        if (nombreEmpresaIndex) {
            await queryRunner.dropIndex("unidades_medida", nombreEmpresaIndex);
        }

        const abreviaturaEmpresaIndex = table?.indices.find(index => index.name === "IDX_unidades_medida_abreviatura_empresa");
        if (abreviaturaEmpresaIndex) {
            await queryRunner.dropIndex("unidades_medida", abreviaturaEmpresaIndex);
        }
        
        // Eliminar la constraint foreign key
        const foreignKey = table?.foreignKeys.find(fk => fk.name === "FK_unidades_medida_empresa");
        if (foreignKey) {
            await queryRunner.dropForeignKey("unidades_medida", foreignKey);
        }
        
        // Eliminar la columna
        const columnExists = table?.columns.find(column => column.name === "empresa_id");
        if (columnExists) {
            await queryRunner.dropColumn("unidades_medida", "empresa_id");
        }
    }
}