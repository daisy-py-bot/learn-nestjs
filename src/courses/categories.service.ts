import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseCategory } from './course-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CourseCategory)
    private categoryRepo: Repository<CourseCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepo.findOne({
      where: { name: createCategoryDto.name }
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepo.create(createCategoryDto);
    return this.categoryRepo.save(category);
  }

  async findAll() {
    return this.categoryRepo.find({
      order: { order: 'ASC', name: 'ASC' }
    });
  }

  async findActive() {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { order: 'ASC', name: 'ASC' }
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['courses']
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    // If name is being updated, check for conflicts
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepo.findOne({
        where: { name: updateCategoryDto.name }
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    
    // Check if category has courses
    if (category.courses && category.courses.length > 0) {
      throw new ConflictException('Cannot delete category that has courses. Please reassign or delete the courses first.');
    }

    return this.categoryRepo.remove(category);
  }

  async seedDefaultCategories() {
    const defaultCategories = [
      { name: 'Career Skills', description: 'Skills for professional development', order: 1 },
      { name: 'Money Matters', description: 'Financial literacy and management', order: 2 },
      { name: 'Communication Skills', description: 'Effective communication techniques', order: 3 },
      { name: 'Digital Tools', description: 'Technology and digital skills', order: 4 },
      { name: 'Personal Growth', description: 'Self-improvement and development', order: 5 },
      { name: 'Interviews', description: 'Interview preparation and techniques', order: 6 },
      { name: 'Leadership', description: 'Leadership and management skills', order: 7 },
      { name: 'Teamwork & Collaboration', description: 'Working effectively in teams', order: 8 },
      { name: 'Time Management', description: 'Productivity and time organization', order: 9 },
      { name: 'Emotional Intelligence', description: 'EQ and interpersonal skills', order: 10 },
      { name: 'Critical Thinking', description: 'Analytical and reasoning skills', order: 11 },
      { name: 'Problem Solving', description: 'Creative problem-solving approaches', order: 12 },
      { name: 'Creativity', description: 'Innovation and creative thinking', order: 13 },
      { name: 'Learning Strategies', description: 'Effective learning methods', order: 14 },
    ];

    const createdCategories: CourseCategory[] = [];
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await this.categoryRepo.findOne({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        const category = this.categoryRepo.create(categoryData);
        const savedCategory = await this.categoryRepo.save(category);
        createdCategories.push(savedCategory);
      }
    }

    return createdCategories;
  }
} 