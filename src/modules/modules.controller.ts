import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Controller('modules')
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Post()
  create(@Body() data: CreateModuleDto) {
    return this.modulesService.create(data);
  }

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updates: UpdateModuleDto) {
    return this.modulesService.update(id, updates);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
