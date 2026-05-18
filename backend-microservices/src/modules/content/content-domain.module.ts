import { Module } from '@nestjs/common';
import { BlogModule } from './blog/blog.module';
import { FaqModule } from './blog/faq.module';
import { GalleryModule } from './blog/gallery.module';
import { ContentModule } from './content/content.module';
import { CommentModule } from './comments/comment.module';
import { GeoModule } from './geo/geo.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { BankDetailsModule } from './bank-details/bank-details.module';
import { TranslationModule } from './translation/translation.module';
import { AboutModule } from './about/about.module';

/**
 * Content domain module.
 * Consolidates blog, FAQ, gallery, content, comments, geo,
 * contact-info, bank-details, translation, and about sub-modules.
 *
 * Note: FAQ and Gallery are co-located with Blog (shared entities).
 */
@Module({
  imports: [
    BlogModule,
    FaqModule,
    GalleryModule,
    ContentModule,
    CommentModule,
    GeoModule,
    ContactInfoModule,
    BankDetailsModule,
    TranslationModule,
    AboutModule,
  ],
  exports: [
    BlogModule,
    FaqModule,
    GalleryModule,
    ContentModule,
    CommentModule,
    GeoModule,
    ContactInfoModule,
    BankDetailsModule,
    TranslationModule,
    AboutModule,
  ],
})
export class ContentDomainModule {}
