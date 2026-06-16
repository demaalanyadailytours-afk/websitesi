/* ═══════════════════════════════════════════════════════════
   DEMA ALANYA DAILY TOURS — main.js
   ═══════════════════════════════════════════════════════════ */

/* ── Navbar sticky shadow on scroll ────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile hamburger menu ──────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  const isOpen = navMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu on nav link click
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
  });
});



/* ── Favourite (heart) toggle ───────────────────────────────── */
document.querySelectorAll('.tour-fav').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const svg = btn.querySelector('svg');
    const isFav = svg.style.fill === 'rgb(239, 68, 68)';
    svg.style.fill = isFav ? 'none' : '#ef4444';
    svg.style.stroke = isFav ? 'currentColor' : '#ef4444';
    btn.style.color = isFav ? '' : '#ef4444';
  });
});

/* ── Animate features bar on scroll ─────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.feature-item, .tour-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
  observer.observe(el);
});

/* ── Reservation button ripple effect ───────────────────────── */
document.querySelectorAll('.btn-primary, .btn-tour, .btn-outline-primary').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      width: 6px; height: 6px;
      background: rgba(255,255,255,0.5);
      top: ${e.clientY - rect.top - 3}px;
      left: ${e.clientX - rect.left - 3}px;
      transform: scale(0);
      animation: rippleAnim 0.5s linear;
      pointer-events: none;
    `;
    if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `@keyframes rippleAnim { to { transform: scale(40); opacity: 0; } }`;
document.head.appendChild(style);

/* ── Tour Detail Gallery ────────────────────────────────────── */
const galleryMainImg = document.querySelector('.gallery-main img');
const galleryThumbs = document.querySelectorAll('.gallery-thumbnails img');

if (galleryMainImg && galleryThumbs.length > 0) {
  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', function() {
      // Remove active class from all
      galleryThumbs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked
      this.classList.add('active');
      // Update main image src
      galleryMainImg.src = this.src;
    });
  });
}

/* ── Tour Detail Booking Logic ───────────────────────────── */
const spinners = document.querySelectorAll('.bw-number-spinner');
const totalDisplay = document.getElementById('bwTotalDisplay');
const adultInput = document.getElementById('adultCount');
const child7Input = document.getElementById('child7Count');
const child0Input = document.getElementById('child0Count');
const btnBookNow = document.getElementById('btnBookNow');

let selectedDate = '9 Haziran 2026'; // Default selected date based on HTML

function updateTotal() {
  if (!adultInput || !child7Input || !totalDisplay) return;
  const adults = parseInt(adultInput.value) || 0;
  const child7 = parseInt(child7Input.value) || 0;
  
  const adultPrice = parseFloat(adultInput.getAttribute('data-price')) || 0;
  const child7Price = parseFloat(child7Input.getAttribute('data-price')) || 0;
  
  // Child 0-6 is free
  const total = (adults * adultPrice) + (child7 * child7Price);
  totalDisplay.innerText = total.toFixed(2) + ' ₺';
}

spinners.forEach(spinner => {
  const btnMinus = spinner.children[0];
  const input = spinner.children[1];
  const btnPlus = spinner.children[2];

  btnMinus.addEventListener('click', () => {
    let val = parseInt(input.value) || 0;
    // Minimum 1 adult is standard, but allowing 0 if they just want to see prices
    if (val > 0) {
      input.value = val - 1;
      updateTotal();
    }
  });

  btnPlus.addEventListener('click', () => {
    let val = parseInt(input.value) || 0;
    input.value = val + 1;
    updateTotal();
  });
});

/* Calendar Click Handler */
const calendarDays = document.querySelectorAll('.bw-calendar-grid .day-active');
calendarDays.forEach(day => {
  day.addEventListener('click', function() {
    // Remove selected from all
    calendarDays.forEach(d => d.classList.remove('selected'));
    // Add selected to clicked
    this.classList.add('selected');
    selectedDate = this.innerText + ' Haziran 2026';
  });
});

/* Save to localStorage and Redirect to Checkout */
if (btnBookNow) {
  btnBookNow.addEventListener('click', (e) => {
    e.preventDefault();
    
    const tourNameAttr = btnBookNow.getAttribute('data-tour-name') || 'Bilinmeyen Tur';
    
    const bookingData = {
      tourName: tourNameAttr,
      date: selectedDate,
      adults: parseInt(adultInput.value) || 0,
      child7: parseInt(child7Input.value) || 0,
      child0: parseInt(child0Input.value) || 0,
      totalPrice: totalDisplay.innerText
    };
    
    // Validations
    if (bookingData.adults === 0 && bookingData.child7 === 0) {
      alert('Lütfen en az 1 kişi seçiniz!');
      return;
    }
    
    localStorage.setItem('demaBooking', JSON.stringify(bookingData));
    window.location.href = 'checkout.html';
  });
}

/* ── Tour Detail Tabs ───────────────────────────────────────── */
const tourTabs = document.querySelectorAll('.tour-tab');
const tabPanes = document.querySelectorAll('.tab-pane');

tourTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tourTabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.style.display = 'none');
    
    tab.classList.add('active');
    const target = document.getElementById(tab.getAttribute('data-tab'));
    if(target) target.style.display = 'block';
  });
});

/* ── Tour Review Form Submission ────────────────────────────── */
const reviewForm = document.getElementById('reviewForm');
if(reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('revName').value;
    const rating = document.getElementById('revRating').value;
    const msg = document.getElementById('revMessage').value;
    
    let starsHtml = '';
    for(let i=0; i<5; i++) {
      starsHtml += i < rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    }

    const reviewList = document.getElementById('reviewsList');
    const newRev = document.createElement('div');
    newRev.className = 'review-item';
    newRev.innerHTML = `
      <div class="review-avatar">${name.charAt(0).toUpperCase()}</div>
      <div class="review-content">
        <div class="review-header">
          <h4>${name}</h4>
          <span class="review-date">Yeni Değerlendirme</span>
        </div>
        <div class="review-stars">${starsHtml}</div>
        <p>${msg}</p>
      </div>
    `;
    reviewList.insertBefore(newRev, reviewList.firstChild);
    reviewForm.reset();
    
    // Switch to review count update (optional UX)
    const tabBtn = document.querySelector('[data-tab="tab-reviews"]');
    if(tabBtn) {
       const currentCount = reviewList.children.length;
       tabBtn.innerText = 'Değerlendirmeler (' + currentCount + ')';
    }

    alert('Değerlendirmeniz başarıyla eklendi! Katkınız için teşekkür ederiz.');
  });
}

console.log('🌊 Dema Alanya Daily Tours — Web sitesi hazır!');


// Tour Filtering Logic

const filterInfo = {
  'all': { title: 'Tüm Turlar', desc: "Alanya, Side ve Belek'in güzelliklerini keşfetmeniz için hazırladığımız özel tur ve gezi seçeneklerimizi inceleyin." },
  'alanya': { title: 'Alanya Turları', desc: "Alanya'nın eşsiz doğasını ve tarihi güzelliklerini keşfedin." },
  'side': { title: 'Side Turları', desc: "Side'nin büyüleyici atmosferinde unutulmaz anılar biriktirin." },
  'belek': { title: 'Belek Turları', desc: "Belek'in lüks ve doğa ile iç içe olan harika turlarını deneyimleyin." },
  'jeep': { title: 'Jeep Safari Turları', desc: "Toz, toprak ve maceraya doyacağınız Jeep Safari rotalarımız." },
  'rafting': { title: 'Rafting Turları', desc: "Serin sularda heyecan ve adrenalin dolu Rafting deneyimi." },
  'atv': { title: 'ATV Safari Turları', desc: "Doğa ile iç içe, aksiyon dolu ATV Safari turlarımız." },
  'buggy': { title: 'Buggy Safari Turları', desc: "Eğlenceli ve heyecan verici Buggy Safari macerasına katılın." },
  'dalis': { title: 'Dalış Turları', desc: "Su altının büyüleyici dünyasını profesyonel eğitmenler eşliğinde keşfedin." },
  'tekne': { title: 'Tekne Turları', desc: "Masmavi koylarda güneşin ve denizin tadını çıkarın." }
};

function updatePageInfo(filterValue) {
  const info = filterInfo[filterValue];
  if (info) {
    const titleEl = document.querySelector('.page-banner-title');
    if (titleEl) {
      titleEl.textContent = info.title;
      const descEl = titleEl.nextElementSibling;
      if (descEl && descEl.tagName === 'P') {
        descEl.textContent = info.desc;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Multi-Contact Widget Logic ---
  const contactHTML = `
    <div class="contact-widget">
      <div class="contact-bubble" id="contactBubble">
        <div class="contact-bubble-header">
          <span>Bize Ulaşın</span>
          <span class="contact-bubble-close" id="contactClose">&times;</span>
        </div>
        <div class="contact-bubble-body">
          <a href="https://wa.me/905514336045" target="_blank" class="contact-item" style="background:#25d366;"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
          <a href="https://t.me/+905514336045" target="_blank" class="contact-item" style="background:#0088cc;"><i class="fa-brands fa-telegram"></i> Telegram</a>
          <a href="viber://chat?number=%2B905514336045" target="_blank" class="contact-item" style="background:#7360f2;"><i class="fa-brands fa-viber"></i> Viber</a>
          <a href="mailto:demaalanyadailytours@gmail.com" target="_blank" class="contact-item" style="background:#ea4335;"><i class="fa-solid fa-envelope"></i> E-Posta</a>
        </div>
      </div>
      <div class="contact-icon" id="contactIcon">
        <i class="fa-solid fa-comment-dots"></i>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', contactHTML);

  const contactBubble = document.getElementById('contactBubble');
  const contactIcon = document.getElementById('contactIcon');
  const contactClose = document.getElementById('contactClose');

  if(contactBubble && contactIcon && contactClose) {
      contactIcon.addEventListener('click', () => {
        contactBubble.classList.toggle('show');
      });

      contactClose.addEventListener('click', () => {
        contactBubble.classList.remove('show');
      });
  }

  // --- Google Translate Language Switcher ---
  function clearGoogtransCookies() {
    const domains = [
      window.location.hostname,
      '.' + window.location.hostname,
      window.location.hostname.replace('www.', ''),
      '.' + window.location.hostname.replace('www.', '')
    ];
    domains.forEach(d => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${d}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
  }

  function setCookie(key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    var domain = window.location.hostname.replace('www.', '');
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;domain=.' + domain;
  }

  document.addEventListener('click', (e) => {
    // Dropdown toggle
    const btn = e.target.closest('#langDropdownBtn');
    if (btn) {
      e.stopPropagation();
      const content = document.getElementById('langDropdownContent');
      if(content) content.classList.toggle('show');
    } else if (!e.target.closest('.lang-dropdown')) {
      const content = document.getElementById('langDropdownContent');
      if(content) content.classList.remove('show');
    }

    // Language select
    const opt = e.target.closest('a[data-lang]');
    if (opt) {
      e.preventDefault();
      const lang = opt.getAttribute('data-lang');
      clearGoogtransCookies();
      if (lang !== 'tr') {
        setCookie('googtrans', '/tr/' + lang, 30);
      }
      window.location.reload();
    }
  });

  // Set initial text based on cookie
  const match = document.cookie.match(/googtrans=\/tr\/([a-z]{2})/);
  const currentLangText = document.getElementById('currentLangText');
  if (match && match[1] && currentLangText) {
    const code = match[1].toUpperCase();
    currentLangText.textContent = code === 'TR' ? 'TR' : code;
  }

  // --- Dropdown Logic ---
  const activityDropBtn = document.getElementById('activityDropBtn');
  const activityDropContent = document.getElementById('activityDropContent');
  
  if (activityDropBtn && activityDropContent) {
    activityDropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activityDropContent.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
      if(activityDropContent.classList.contains('show')) {
         activityDropContent.classList.remove('show');
      }
    });
  }

  // --- Filter Logic ---
  const filterBtns = document.querySelectorAll('.filter-btn, .filter-drop-item');
  const tourCards = document.querySelectorAll('.tour-card-new');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.classList.contains('filter-drop-item')) {
         e.preventDefault(); // In case it's a link or needs prevention
      }
      
      // Remove active from ALL
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // If a dropdown item is clicked, make the dropdown button active too
      if (this.classList.contains('filter-drop-item')) {
        this.classList.add('active');
        if (activityDropBtn) {
            activityDropBtn.classList.add('active');
            activityDropBtn.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${this.textContent} <i class="fa-solid fa-chevron-down" style="font-size: 12px; margin-left: 4px;"></i>`;
        }
      } else {
        this.classList.add('active');
        if (activityDropBtn) {
            activityDropBtn.classList.remove('active');
            activityDropBtn.innerHTML = `<i class="fa-solid fa-layer-group"></i> Aktiviteler <i class="fa-solid fa-chevron-down" style="font-size: 12px; margin-left: 4px;"></i>`;
        }
      }
      
      const filterValue = this.getAttribute('data-filter');
      updatePageInfo(filterValue);
      
      tourCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || cat.includes(filterValue)) {
          card.style.display = 'block';
          // trigger layout reflow for animation
          void card.offsetWidth;
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // URL Parsing on Load
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');
  if (filterParam) {
    const targetBtn = document.querySelector(`.filter-btn[data-filter="${filterParam}"], .filter-drop-item[data-filter="${filterParam}"]`);
    if (targetBtn) {
       targetBtn.click();
    }
  } else {
     updatePageInfo('all');
  }
});
