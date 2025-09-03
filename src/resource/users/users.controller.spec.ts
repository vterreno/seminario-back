import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoginDTO } from './dto/login.dto';
import { AuthGuard } from '../../middlewares/auth.middleware';

describe('UsersController', () => {
    //Hacemos referencia a las instancias que obtendremos del modulo de testing
    let controller: UsersController;
    let service: UsersService;

    // Antes de cada test, armamos un módulo mínimo que contenga
    // SOLO el controlador y un mock del servicio.
    beforeEach(async () => {
        // Primero creamos el modulo de testing declarando el controlador y proveedor
        const module: TestingModule = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
            {
            // Segundo en vez del UsersService real, inyectamos un objeto mock
            // con los métodos que el controlador podría llamar.
            provide: UsersService,
            useValue: {
                login: jest.fn(),
                register: jest.fn(),
                refreshToken: jest.fn(),
                canDo: jest.fn(),
                asignarRol: jest.fn(),
                cambiarContrasena: jest.fn(),
            },
            },
        ],
        })
        //se sobreescribe el guard real usando el controlador 
        // por un guard falso que SIEMPRE permite el acceso.
        .overrideGuard(AuthGuard)
        .useValue({ canActivate: () => true })
        .compile();
        // Aqui obtenemos instancias ya construidas y con dependencias inyectadas
        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    describe('login', () => {
        it('iniciar sesion correctamente', async () => {
        // definimos la respuesta simulada que debería devolver el service.login
        const result = {
            accessToken: 'fakeAccess',
            refreshToken: 'fakeRefresh',
        };
        // armamos el cuerpo válido para el login (DTO)
        const parametro: LoginDTO = {
            email: 'ignacio@sala20',
            password: '12345678',
        };
        // indicamos que cuando el controlador llame a service.login,
        // jest devuelva la promesa resuelta con "result"
        jest.spyOn(service, 'login').mockResolvedValue(result);

        // invocamos el método del controlador tal como lo haría Nest
        const response = await controller.login(parametro);

        // verificamos que el controlador devuelve lo que el servicio mockeado retorna
        expect(response).toBe(result);
        });
    });
});
