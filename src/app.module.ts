import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'daisy',
      database: '_uncommon',
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity.{ts,js}'],

    }),
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
    BadgesModule

  ],
})
export class AppModule {}
