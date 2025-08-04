const { DataSource } = require('typeorm');
const { CourseCategory } = require('./dist/courses/course-category.entity');

async function seedCategories() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'learn_nestjs',
    entities: [CourseCategory],
    synchronize: false,
  });

  await dataSource.initialize();

  const categoryRepository = dataSource.getRepository(CourseCategory);

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

  console.log('Seeding default categories...');

  for (const categoryData of defaultCategories) {
    const existingCategory = await categoryRepository.findOne({
      where: { name: categoryData.name }
    });

    if (!existingCategory) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`Created category: ${categoryData.name}`);
    } else {
      console.log(`Category already exists: ${categoryData.name}`);
    }
  }

  console.log('Category seeding completed!');
  await dataSource.destroy();
}

seedCategories().catch(console.error); 