import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { User } from 'src/users/user.entity';
import { Course } from 'src/courses/course.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/activity-log.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    private activityLogsService: ActivityLogsService,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });

    if (!user || !course) throw new NotFoundException('User or course not found');

    const feedback = this.feedbackRepo.create({
      user,
      course,
      rating: dto.rating,
      comment: dto.comment,
      testimonial: dto.testimonial,
      publicOk: dto.publicOk ?? false,
      fullResponse: dto.fullResponse ?? null,
    });

    const saved = await this.feedbackRepo.save(feedback);

    // Log feedback submission
    await this.activityLogsService.create({
      userId: user.id,
      actionType: ActionType.SUBMITTED_FEEDBACK,
      metadata: { courseId: course.id, feedbackId: saved.id },
    });

    return saved;
  }

  findAllForCourse(courseId: string) {
    return this.feedbackRepo.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
  }

  findPublicTestimonials(courseId: string) {
    return this.feedbackRepo.find({
      where: { course: { id: courseId }, publicOk: true },
    });
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    Object.assign(feedback, dto);
    return this.feedbackRepo.save(feedback);
  }

  async remove(id: string) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    return this.feedbackRepo.remove(feedback);
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return this.feedbackRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }

  async getAllFeedbackForAdmin() {
    return this.feedbackRepo.find({
      relations: ['user', 'course'],
      order: { id: 'DESC' }
    });
  }

  async getFeedbackStatistics() {
    // Get all feedback
    const allFeedback = await this.feedbackRepo.find({
      relations: ['course']
    });

    if (allFeedback.length === 0) {
      return {
        averageRating: 'N/A',
        topSuggestion: 'N/A',
        topRatedCourse: 'N/A',
        needsAttention: 'N/A',
        wouldRecommend: 'N/A'
      };
    }

    // Calculate average rating
    const totalRating = allFeedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = (totalRating / allFeedback.length).toFixed(1);

    // Find top suggestion (most mentioned word in comments)
    const allComments = allFeedback
      .map(f => f.comment)
      .filter(comment => comment && comment.trim().length > 0)
      .join(' ')
      .toLowerCase();
    
    const words = allComments
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'they', 'will', 'from', 'your', 'more', 'very', 'just', 'what', 'when', 'where', 'were', 'been', 'good', 'great', 'nice', 'like', 'well', 'much', 'many', 'some', 'time', 'make', 'take', 'give', 'find', 'want', 'need', 'know', 'think', 'feel', 'look', 'work', 'help', 'tell', 'show', 'come', 'goes', 'gets', 'says', 'said', 'does', 'done', 'made', 'used', 'also', 'only', 'even', 'still', 'back', 'over', 'under', 'between', 'through', 'during', 'before', 'after', 'above', 'below', 'about', 'against', 'among', 'around', 'behind', 'beneath', 'beside', 'beyond', 'inside', 'outside', 'within', 'without'].includes(word));
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const topSuggestion = Object.keys(wordCount).length > 0 
      ? Object.keys(wordCount).reduce((a, b) => wordCount[a] > wordCount[b] ? a : b)
      : 'N/A';

    // Find top rated course
    const courseRatings = {};
    allFeedback.forEach(f => {
      if (!courseRatings[f.course.id]) {
        courseRatings[f.course.id] = { total: 0, count: 0, name: f.course.title };
      }
      courseRatings[f.course.id].total += f.rating;
      courseRatings[f.course.id].count += 1;
    });

    const courseAverages = Object.values(courseRatings).map((cr: any) => ({
      name: cr.name,
      average: cr.total / cr.count
    }));

    const topRatedCourse = courseAverages.length > 0 
      ? courseAverages.reduce((a, b) => a.average > b.average ? a : b).name
      : 'N/A';

    // Find course needing attention (lowest average rating)
    const needsAttention = courseAverages.length > 0 
      ? courseAverages.reduce((a, b) => a.average < b.average ? a : b).name
      : 'N/A';

    // Calculate would recommend percentage (ratings 4-5)
    const highRatings = allFeedback.filter(f => f.rating >= 4).length;
    const wouldRecommend = Math.round((highRatings / allFeedback.length) * 100);

    return {
      averageRating: `${averageRating}/5`,
      topSuggestion: topSuggestion.charAt(0).toUpperCase() + topSuggestion.slice(1),
      topRatedCourse,
      needsAttention,
      wouldRecommend: `${wouldRecommend}%`
    };
  }
}
