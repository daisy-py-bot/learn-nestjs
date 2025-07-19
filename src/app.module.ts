import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { CoursesModule } from './courses/courses.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { FinalAssessmentsModule } from './final-assessments/final-assessments.module';
import { CertificatesModule } from './certificates/certificates.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { BadgesModule } from './badges/badges.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Use environment variables in TypeORM config
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity.{ts,js}'],
    }),

    // Feature modules
    UsersModule,
    CoursesModule,
    ModulesModule,
    LessonsModule,
    ProgressModule,
    QuizzesModule,
    FinalAssessmentsModule,
    CertificatesModule,
    EnrollmentsModule,
    SubmissionsModule,
    FeedbackModule,
    ActivityLogsModule,
    BadgesModule,
    AdminModule,
    AuthModule,
  ],
})
export class AppModule {}
