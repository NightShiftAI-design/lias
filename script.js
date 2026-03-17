// ============================================
//  LIA'S CLEANING CO. — script.js
//  Handles: nav, scroll reveal, FAQ accordion,
//  contact form (SMS/mailto), booking form (mailto)
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. TOPBAR HEIGHT + NAV OFFSET
  // ==========================================
  const topbar = document.querySelector('.topbar');
  const nav    = document.getElementById('nav');

  function getNavOffset() {
    return (topbar ? topbar.offsetHeight : 0) + (nav ? nav.querySelector('.nav__inner').offsetHeight : 68);
  }

  // Shift nav below topbar when scrolled
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 10;
    nav.classList.toggle('scrolled', scrolled);
  }, { passive: true });


  // ==========================================
  // 2. HAMBURGER / MOBILE MENU
  // ==========================================
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    const [s1, s2, s3] = hamburger.querySelectorAll('span');
    if (isOpen) {
      s1.style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      s2.style.cssText = 'opacity:0;transform:translateX(-6px)';
      s3.style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      [s1,s2,s3].forEach(s => s.style.cssText = '');
    }
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
    });
  });


  // ==========================================
  // 3. SMOOTH SCROLL (anchor links)
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = getNavOffset() + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ==========================================
  // 4. SCROLL REVEAL (IntersectionObserver)
  // ==========================================
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Stagger siblings
        const siblings = [...(entry.target.parentElement?.querySelectorAll('[data-reveal]:not(.revealed)') || [])];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('revealed'), idx * 90);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }


  // ==========================================
  // 5. FAQ ACCORDION
  // ==========================================
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        openItem.querySelector('.faq-a')?.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        ans.classList.add('open');
      }
    });
  });


  // ==========================================
  // 6. PHONE FORMAT HELPER
  // ==========================================
  function formatPhone(input) {
    input.addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 10);
      if (d.length >= 7)      e.target.value = `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
      else if (d.length >= 4) e.target.value = `(${d.slice(0,3)}) ${d.slice(3)}`;
      else                    e.target.value = d;
    });
  }
  document.querySelectorAll('input[type="tel"]').forEach(formatPhone);


  // ==========================================
  // 7. SET MIN DATE FOR BOOKING DATE PICKER
  // ==========================================
  const dateInput = document.getElementById('b-date');
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Earliest = tomorrow
    dateInput.min = today.toISOString().split('T')[0];
  }


  // ==========================================
  // 8. CONTACT FORM
  //    Priority: SMS (mobile) → mailto fallback
  // ==========================================
  const contactForm   = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  const SMS_NUMBER    = '6156749399'; // Primary contact number
  const EMAIL_ADDRESS = 'liascleaningco@gmail.com';

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('c-name')?.value.trim()    || '';
    const phone   = document.getElementById('c-phone')?.value.trim()   || 'Not provided';
    const email   = document.getElementById('c-email')?.value.trim()   || 'Not provided';
    const service = document.getElementById('c-service')?.value.trim() || 'Not specified';
    const message = document.getElementById('c-message')?.value.trim() || '';

    if (!name) {
      showStatus(contactStatus, '⚠️ Please enter your name.', 'error');
      document.getElementById('c-name')?.focus();
      return;
    }

    // Build message body
    const body = [
      `Hi Lia's Cleaning! I'd like to get in touch.`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Message: ${message || 'No additional message'}`,
    ].join('\n');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Try SMS first on mobile
      const smsUri = `sms:${SMS_NUMBER}?body=${encodeURIComponent(body)}`;
      window.location.href = smsUri;
      showStatus(contactStatus, '📱 Opening Messages app with your info pre-filled...', 'success');
    } else {
      // Desktop: open email
      const subject = encodeURIComponent(`Quote Request – Lia's Cleaning Co.`);
      const mailtoUri = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUri, '_blank');
      showStatus(contactStatus, '✉️ Opening your email client with your message pre-filled...', 'success');
    }

    // Optionally reset form after short delay
    setTimeout(() => contactForm.reset(), 2000);
  });


  // ==========================================
  // 9. BOOKING FORM
  //    Sends full booking details via mailto:
  //    (opens default email client pre-filled)
  // ==========================================
  const bookingForm   = document.getElementById('bookingForm');
  const bookingStatus = document.getElementById('bookingStatus');

  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect all fields
    const fields = {
      'Full Name':           document.getElementById('b-name')?.value.trim()      || '',
      'Phone':               document.getElementById('b-phone')?.value.trim()     || '',
      'Email':               document.getElementById('b-email')?.value.trim()     || '',
      'Property Address':    document.getElementById('b-address')?.value.trim()   || '',
      'Type of Cleaning':    document.getElementById('b-service')?.value          || '',
      'Bedrooms':            document.getElementById('b-beds')?.value             || 'Not specified',
      'Bathrooms':           document.getElementById('b-baths')?.value            || 'Not specified',
      'Square Footage':      document.getElementById('b-sqft')?.value             || 'Not specified',
      'Last Professional Cleaning': document.getElementById('b-lastclean')?.value || 'Not specified',
      'Pets in Home':        document.getElementById('b-pets')?.value             || 'Not specified',
      'Areas of Concern':    document.getElementById('b-concerns')?.value.trim()  || 'None',
      'Preferred Date':      document.getElementById('b-date')?.value             || 'Flexible',
      'Preferred Time':      document.getElementById('b-time')?.value             || 'Flexible',
      'Additional Notes':    document.getElementById('b-notes')?.value.trim()     || 'None',
    };

    // Validate required
    const requiredIds = ['b-name', 'b-phone', 'b-email', 'b-address', 'b-service', 'b-beds', 'b-baths'];
    let allValid = true;
    requiredIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.borderColor = '';
        if (!el.value.trim()) {
          el.style.borderColor = '#f43f5e';
          allValid = false;
        }
      }
    });

    if (!allValid) {
      showStatus(bookingStatus, '⚠️ Please fill in all required fields.', 'error');
      bookingForm.querySelector('[required]')?.focus();
      return;
    }

    // Build email body
    const divider = '─────────────────────────────────';
    const bodyLines = [
      `NEW BOOKING REQUEST — Lia's Cleaning Co.`,
      divider,
      ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`),
      divider,
      `Submitted via website booking form.`,
      `NOTE: Review home condition and confirm availability before replying.`,
    ];
    const body = bodyLines.join('\n');

    const subject = encodeURIComponent(`New Booking Request – Lia's Cleaning Co.`);
    const mailtoUri = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoUri;

    showStatus(
      bookingStatus,
      '✅ Opening your email client — your booking details are pre-filled. Press Send to submit!',
      'success'
    );

    setTimeout(() => bookingForm.reset(), 3000);
  });


  // ==========================================
  // 10. STATUS MESSAGE HELPER
  // ==========================================
  function showStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'error' ? '#f43f5e' : '#16a34a';
    setTimeout(() => { if (el) el.textContent = ''; }, 8000);
  }


  // ==========================================
  // 11. ACTIVE NAV HIGHLIGHT ON SCROLL
  // ==========================================
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav__links a:not(.nav__book)');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + getNavOffset() + 60;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        navAnchors.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${section.id}`) {
            link.style.color = 'var(--rose-mid)';
          }
        });
      }
    });
  }, { passive: true });

}); // end DOMContentLoaded
