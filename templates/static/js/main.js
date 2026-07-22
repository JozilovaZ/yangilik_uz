// Mobil menyu ochish/yopish
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // Til dropdown
    var langDd = document.querySelector('.lang-dd');
    var langToggle = document.querySelector('.lang-dd__toggle');
    if (langDd && langToggle) {
        langToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = langDd.classList.toggle('is-open');
            langToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        // Tashqariga bosilganda yopish
        document.addEventListener('click', function (e) {
            if (!langDd.contains(e.target)) {
                langDd.classList.remove('is-open');
                langToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Hisob (foydalanuvchi) dropdown
    var userDd = document.querySelector('.user-dd');
    var userToggle = document.querySelector('.user-dd__toggle');
    if (userDd && userToggle) {
        userToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = userDd.classList.toggle('is-open');
            userToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', function (e) {
            if (!userDd.contains(e.target)) {
                userDd.classList.remove('is-open');
                userToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Qidiruv: ikonka bosilganda maydon ochiladi
    var searchBox = document.getElementById('searchBox');
    if (searchBox) {
        var searchToggle = searchBox.querySelector('.search__toggle');
        var searchInput = searchBox.querySelector('.search__input');
        searchToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = searchBox.classList.toggle('is-open');
            searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                searchInput.focus();
            } else if (searchInput.value.trim() !== '') {
                // matn bo'lsa yopishda yubormaymiz, faqat yig'amiz
            }
        });
        // Tashqariga bosilganda yopish (agar maydon bo'sh bo'lsa)
        document.addEventListener('click', function (e) {
            if (!searchBox.contains(e.target) && searchInput.value.trim() === '') {
                searchBox.classList.remove('is-open');
                searchToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Aylanib turadigan xabarlar (breaking news)
    var rotator = document.getElementById('newsRotator');
    if (rotator) {
        var items = rotator.querySelectorAll('.news-rotator__item');
        if (items.length > 1) {
            var idx = 0;
            setInterval(function () {
                items[idx].classList.remove('is-active');
                idx = (idx + 1) % items.length;
                items[idx].classList.add('is-active');
            }, 4000);
        }
    }
});
