/* =========================================================
   NEXUM TRAINING CENTER — SHARED SCRIPT
   Handles: nav toggle, scroll shadow, active-link highlight,
   scroll-reveal animation, animated counters, course filters,
   FAQ accordion, contact form validation, back-to-top.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Sticky nav shadow ---------- */
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    var onScrollNav = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ---------- Active nav link by current page ---------- */
  var current = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
    var href = a.getAttribute('href').split('/').pop();
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Course filter (courses.html) ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var courseCards = document.querySelectorAll('[data-category]');
  if (filterBtns.length && courseCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        courseCards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
          if (match) {
            card.classList.remove('reveal');
            void card.offsetWidth;
            card.style.opacity = 0;
            card.style.transform = 'translateY(14px)';
            requestAnimationFrame(function () {
              card.style.transition = 'opacity .4s ease, transform .4s ease';
              card.style.opacity = 1;
              card.style.transform = 'translateY(0)';
            });
          }
        });
      });
    });
  }

  /* ---------- FAQ accordion (contact.html) ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var validators = {
      name: function (v) { return v.trim().length >= 2 || 'Please enter your full name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.'; },
      phone: function (v) { return /^[0-9+\-\s()]{7,}$/.test(v) || 'Enter a valid phone number.'; },
      course: function (v) { return v !== '' || 'Please select a course.'; },
      message: function (v) { return v.trim().length >= 10 || 'Message should be at least 10 characters.'; }
    };

    function validateField(field) {
      var name = field.name;
      if (!validators[name]) return true;
      var result = validators[name](field.value);
      var group = field.closest('.form-group');
      if (result === true) {
        group.classList.remove('invalid');
        return true;
      } else {
        group.classList.add('invalid');
        group.querySelector('.field-error').textContent = result;
        return false;
      }
    }

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        if (!validateField(field)) valid = false;
      });
      var status = document.getElementById('form-status');
      if (valid) {
        status.textContent = 'Thank you! Your message has been sent. Our team will get back to you within 24 hours.';
        status.classList.add('show', 'ok');
        form.reset();
        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        setTimeout(function () { submitBtn.disabled = false; }, 2500);
      } else {
        status.textContent = 'Please fix the highlighted fields and try again.';
        status.classList.add('show');
        status.classList.remove('ok');
      }
      setTimeout(function () { status.classList.remove('show'); }, 6000);
    });
  }

  /* ---------- Pre-select course from ?course= query param ---------- */
  var courseSelect = document.getElementById('course');
  if (courseSelect) {
    var params = new URLSearchParams(window.location.search);
    var courseParam = params.get('course');
    if (courseParam) {
      var opt = courseSelect.querySelector('option[value="' + courseParam + '"]');
      if (opt) courseSelect.value = courseParam;
    }
  }

  /* ---------- Back to top ---------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Hero terminal typing effect (index.html) ---------- */
  var typeEl = document.querySelector('[data-typewriter]');
  if (typeEl) {
    var phrases = JSON.parse(typeEl.getAttribute('data-typewriter'));
    var pIndex = 0, cIndex = 0, deleting = false;
    function typeLoop() {
      var phrase = phrases[pIndex];
      if (!deleting) {
        cIndex++;
        typeEl.textContent = phrase.slice(0, cIndex);
        if (cIndex === phrase.length) {
          deleting = true;
          setTimeout(typeLoop, 1400);
          return;
        }
      } else {
        cIndex--;
        typeEl.textContent = phrase.slice(0, cIndex);
        if (cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
        }
      }
      setTimeout(typeLoop, deleting ? 35 : 55);
    }
    typeLoop();
  }
});
