# ============================================================
#  Django management buyrug'i — maqolalarga mavzuga oid muqova
#  rasm biriktiradi (kategoriya bo'yicha).
#
#  JOYLASHTIRISH:
#    <backend>/<app>/management/commands/assign_cover_images.py
#    (agar "management" va "commands" papkalari yo'q bo'lsa yarating
#     va har biriga bo'sh __init__.py fayl qo'ying)
#
#  ISHGA TUSHIRISH (server yoki backend papkasida):
#    # Pexels bilan (mavzuga oid, tavsiya):
#    export PEXELS_API_KEY=xxxxxxxx   # Windows: set PEXELS_API_KEY=xxxx
#    python manage.py assign_cover_images
#
#    # Faqat rasmi yo'q maqolalarga:
#    python manage.py assign_cover_images --only-missing
#
#    # Hammasini qayta yozish:
#    python manage.py assign_cover_images --all
#
#  Pexels bepul kalit: https://www.pexels.com/api/  (Register -> API key)
#  Kalit berilmasa, quyidagi tayyor Unsplash ro'yxatidan foydalanadi.
# ============================================================
import os
import random
import time

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

# !!! SHU QATORNI O'Z MODELINGIZGA MOSLANG !!!
# Agar app nomi "news" bo'lsa shundayligicha qoldiring.
from news.models import Article


# Har kategoriya uchun Pexels qidiruv so'zi (inglizcha aniqroq topadi)
CATEGORY_QUERY = {
    "siyosat": "government parliament politics",
    "iqtisod": "economy finance business money",
    "jamiyat": "society people city life",
    "sport": "sport stadium athlete",
    "texnologiya": "technology computer gadget",
    "dunyo": "world globe international news",
}

# Kalitsiz ishlaganda ishlatiladigan tayyor rasmlar (Unsplash, to'g'ridan-to'g'ri)
FALLBACK_IMAGES = {
    "siyosat": [
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=1200&q=80",
    ],
    "iqtisod": [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    ],
    "jamiyat": [
        "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    ],
    "sport": [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=1200&q=80",
    ],
    "texnologiya": [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    ],
    "dunyo": [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
    ],
}
DEFAULT_QUERY = "news uzbekistan"
DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"


class Command(BaseCommand):
    help = "Maqolalarga kategoriya bo'yicha mavzuga oid muqova rasm biriktiradi."

    def add_arguments(self, parser):
        parser.add_argument("--all", action="store_true", help="Hamma maqolani qayta yozish")
        parser.add_argument("--only-missing", action="store_true", help="Faqat rasmi yo'qlarga")
        parser.add_argument("--sleep", type=float, default=0.4, help="Har so'rov orasidagi kutish (soniya)")

    def handle(self, *args, **opts):
        api_key = os.environ.get("PEXELS_API_KEY")
        mode_all = opts["all"]
        only_missing = opts["only_missing"] or not mode_all  # default: faqat yo'qlarga

        qs = Article.objects.all()
        if only_missing:
            qs = qs.filter(cover_image="") | Article.objects.filter(cover_image__isnull=True)
            qs = qs.distinct()

        total = qs.count()
        self.stdout.write(f"Jami maqola: {total} | Manba: {'Pexels' if api_key else 'Unsplash (fallback)'}")

        ok, fail = 0, 0
        for i, article in enumerate(qs.iterator(), 1):
            slug = self._category_slug(article)
            try:
                content, ext = self._get_image(slug, api_key)
                if not content:
                    fail += 1
                    continue
                fname = f"{slug or 'news'}-{article.pk}.{ext}"
                article.cover_image.save(fname, ContentFile(content), save=True)
                ok += 1
                self.stdout.write(f"[{i}/{total}] ✔ {article.pk} ({slug}) -> {fname}")
            except Exception as e:  # noqa: BLE001
                fail += 1
                self.stderr.write(f"[{i}/{total}] x {article.pk}: {e}")
            time.sleep(opts["sleep"])

        self.stdout.write(self.style.SUCCESS(f"Tayyor. Muvaffaqiyatli: {ok}, xato: {fail}"))

    # ---- yordamchilar ----
    def _category_slug(self, article):
        cat = getattr(article, "category", None)
        return getattr(cat, "slug", None) or ""

    def _get_image(self, slug, api_key):
        if api_key:
            url = self._pexels_url(slug, api_key)
        else:
            pool = FALLBACK_IMAGES.get(slug) or [DEFAULT_FALLBACK]
            url = random.choice(pool)
        if not url:
            return None, "jpg"
        r = requests.get(url, timeout=25)
        r.raise_for_status()
        ext = "jpg"
        ct = r.headers.get("content-type", "")
        if "png" in ct:
            ext = "png"
        elif "webp" in ct:
            ext = "webp"
        return r.content, ext

    def _pexels_url(self, slug, api_key):
        query = CATEGORY_QUERY.get(slug, DEFAULT_QUERY)
        resp = requests.get(
            "https://api.pexels.com/v1/search",
            params={"query": query, "per_page": 20, "orientation": "landscape"},
            headers={"Authorization": api_key},
            timeout=25,
        )
        resp.raise_for_status()
        photos = resp.json().get("photos", [])
        if not photos:
            return None
        photo = random.choice(photos)
        # yaxshi o'lcham
        return photo["src"].get("large") or photo["src"].get("original")
