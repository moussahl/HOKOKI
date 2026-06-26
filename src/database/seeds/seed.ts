import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Law } from '../entities/law.entity';
import { LawArticle } from '../entities/law-article.entity';
import { Procedure } from '../entities/procedure.entity';
import { ProcedureStep } from '../entities/procedure-step.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const lawRepo = dataSource.getRepository(Law);
  const articleRepo = dataSource.getRepository(LawArticle);
  const procedureRepo = dataSource.getRepository(Procedure);
  const stepRepo = dataSource.getRepository(ProcedureStep);

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  await userRepo.upsert(
    { email: 'admin@hokoki.dz', fullName: 'Admin', passwordHash: adminHash, role: UserRole.ADMIN, preferredLanguage: 'ar' },
    { conflictPaths: ['email'] },
  );

  // Expert user
  const expertHash = await bcrypt.hash('expert123', 12);
  await userRepo.upsert(
    { email: 'expert@hokoki.dz', fullName: 'محامي أحمد', passwordHash: expertHash, role: UserRole.EXPERT, isVerifiedExpert: true, preferredLanguage: 'ar' },
    { conflictPaths: ['email'] },
  );

  // Citizen user
  const citizenHash = await bcrypt.hash('citizen123', 12);
  await userRepo.upsert(
    { email: 'citizen@hokoki.dz', fullName: 'مواطن جزائري', passwordHash: citizenHash, role: UserRole.CITIZEN, preferredLanguage: 'ar' },
    { conflictPaths: ['email'] },
  );

  // Sample laws
  const law1 = await lawRepo.save({
    slug: 'code-du-travail',
    title: 'قانون العمل',
    category: 'labor',
    language: 'ar',
    sourceUrl: 'https://www.joradp.dz/',
    summary: 'ينظم قانون العمل العلاقات بين العمال وأرباب العمل في الجزائر',
  });

  const law2 = await lawRepo.save({
    slug: 'code-de-la-famille',
    title: 'قانون الأسرة',
    category: 'family',
    language: 'ar',
    sourceUrl: 'https://www.joradp.dz/',
    summary: 'يتعلق قانون الأسرة بالأحوال الشخصية والزواج والطلاق',
  });

  // Sample articles
  await articleRepo.save([
    { law: law1, articleNumber: '1', title: 'نطاق التطبيق', originalText: 'يطبق هذا القانون على جميع العمال الذين يمارسون نشاطا مهنيا في إطار عقد عمل.', simpleText: 'هذا القانون يخص كل شخص عنده عقد عمل في الجزائر.' },
    { law: law1, articleNumber: '7', title: 'عقد العمل', originalText: 'عقد العمل هو اتفاق بين عامل ورب عمل يلتزم بموجبه العامل بأداء عمل معين تحت سلطة رب العمل.', simpleText: 'عقد العمل هو اتفاق بينك وبين صاحب العمل تحدد فيه شروط العمل.' },
    { law: law1, articleNumber: '14', title: 'أجر العمل', originalText: 'الأجر هو المقابل الذي يتقاضاه العامل مقابل عمله.', simpleText: 'الأجر هو الفلوس اللي تاخذها مقابل شغلك.' },
    { law: law2, articleNumber: '1', title: 'تعريف الزواج', originalText: 'الزواج عقد شرعي يتم بين رجل وامرأة.', simpleText: 'الزواج هو عقد قانوني بين راجل ومراة.' },
    { law: law2, articleNumber: '4', title: 'شروط الزواج', originalText: 'يشترط لصحة الزواج توفر الإرادة الحرة للطرفين.', simpleText: 'لازم يكون الاتنين موافقين على الزواج بكل إرادتهم.' },
  ]);

  // Sample procedures
  const proc1 = await procedureRepo.save({
    key: 'declaration-naissance',
    title: 'إجراءات تسجيل مولود جديد',
    description: 'خطوات تسجيل مولود جديد في الجزائر بداية من شهادة الميلاد',
  });

  await stepRepo.save([
    { procedure: proc1, stepOrder: 1, title: 'الحصول على شهادة الميلاد', description: 'توجه إلى المستشفى أو مصالح الحالة المدنية', requiredDocuments: ['بطاقة التعاون', 'شهادة الزواج'], locationHint: 'مصلحة الحالة المدنية بالبلدية' },
    { procedure: proc1, stepOrder: 2, title: 'التصريح بالمولود', description: 'قم بالتصريح بالمولود في غضون 5 أيام', requiredDocuments: ['شهادة الميلاد', 'بطاقة التعاون'], locationHint: 'بلدية مكان الولادة' },
    { procedure: proc1, stepOrder: 3, title: 'استخراج دفتر العائلة', description: 'تحديث دفتر العائلة بإضافة المولود الجديد', requiredDocuments: ['شهادة الميلاد', 'دفتر العائلة'], locationHint: 'مصلحة الحالة المدنية' },
  ]);

  const proc2 = await procedureRepo.save({
    key: 'plainte-penale',
    title: 'إجراءات تقديم شكوى جزائية',
    description: 'خطوات تقديم شكوى أمام النيابة العامة في الجزائر',
  });

  await stepRepo.save([
    { procedure: proc2, stepOrder: 1, title: 'تحرير الشكوى', description: 'قم بتحرير شكوى مكتوبة تتضمن الوقائع', requiredDocuments: ['بطاقة التعاون'], locationHint: 'كتابة الضبط' },
    { procedure: proc2, stepOrder: 2, title: 'التقديم لدى النيابة', description: 'قدم الشكوى إلى وكيل الجمهورية', requiredDocuments: ['الشكوى', 'بطاقة التعاون'], locationHint: 'محكمة المقاطعة' },
    { procedure: proc2, stepOrder: 3, title: 'متابعة الإجراءات', description: 'تابع سير الشكوى عبر مصالح الضبطية القضائية', requiredDocuments: ['رقم الشكوى'], locationHint: 'الضبطية القضائية' },
  ]);

  console.log('Seed completed successfully');
  await app.close();
}

bootstrap();
