import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { EventsModule } from './modules/events/events.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SearchModule } from './modules/search/search.module';
import { MediaModule } from './media/media.module';
import { ReferralsModule } from './referrals/referrals.module';
import { PromoController } from './promo/promo.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { CheckinController } from './checkin/checkin.controller';
import { CheckinService } from './checkin/checkin.service';
import { PolicyController } from './policy/policy.controller';
import { PolicyService } from './policy/policy.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => require('./config/app.config').default()] }),
    AuthModule,
    UsersModule,
    VenuesModule,
    EventsModule,
    TicketsModule,
    OrdersModule,
    PaymentsModule,
    SearchModule,
    MediaModule,
    ReferralsModule,
  ]
  ,controllers: [PromoController, NotificationsController, CheckinController, PolicyController]
  ,providers: [CheckinService, PolicyService]
})
export class AppModule {}
