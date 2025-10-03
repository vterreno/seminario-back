import { Test, TestingModule } from '@nestjs/testing';
import { ListaPreciosController } from './lista-precios.controller';
import { ListaPreciosService } from './lista-precios.service';

describe('ListaPreciosController', () => {
  let controller: ListaPreciosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListaPreciosController],
      providers: [ListaPreciosService],
    }).compile();

    controller = module.get<ListaPreciosController>(ListaPreciosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
