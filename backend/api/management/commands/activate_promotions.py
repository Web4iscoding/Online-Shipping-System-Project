"""
Management command to activate promotions whose start date has arrived
and send wishlist sale notifications for newly activated promotions.

Run periodically via cron, e.g.:
    python manage.py activate_promotions

Recommended schedule: every hour or every few minutes, depending on
how promptly you want notifications to go out.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import Notification, Promotion, WishlistItem


class Command(BaseCommand):
    help = (
        'Activate promotions whose start date has arrived, '
        'send wishlist sale notifications, and deactivate expired promotions.'
    )

    def handle(self, *args, **options):
        now = timezone.now()

        # 1. Activate promotions that should now be active and notify
        newly_active = Promotion.objects.filter(
            status='Inactive',
            notificationSent=False,
            startDate__lte=now,
            endDate__gte=now,
        )

        activated_count = 0
        notified_count = 0

        for promo in newly_active:
            promo.status = 'Active'
            promo.notificationSent = True
            promo.save(update_fields=['status', 'notificationSent', 'updatedTime'])
            activated_count += 1

            product = promo.productID
            discount = promo.discountRate

            wishlist_items = WishlistItem.objects.filter(
                productID=product
            ).select_related('customerID__user')

            for wi in wishlist_items:
                Notification.objects.create(
                    user=wi.customerID.user,
                    notificationType='wishlist_sale',
                    title='Wishlist Item On Sale',
                    message=f'{product.productName} is now {discount}% off!',
                    link=f'/product/{product.productID}',
                    productID=product,
                )
                notified_count += 1

        # 2. Deactivate promotions that have expired
        expired = Promotion.objects.filter(
            status='Active',
            endDate__lt=now,
        )
        expired_count = expired.update(status='Inactive')

        self.stdout.write(
            self.style.SUCCESS(
                f'Activated {activated_count} promotion(s), '
                f'sent {notified_count} notification(s), '
                f'deactivated {expired_count} expired promotion(s).'
            )
        )
