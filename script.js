document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const responseEl = document.getElementById('form-response');

  // Local check (optional – can disable if backend handles limits)
  const MAX_BOOKINGS_PER_DAY = 3;

  // Your Google Apps Script Web App URL
  const sheetScriptURL =
    'https://script.google.com/macros/s/AKfycby_kZK0KV04BYTu4WrYUL5EvfQ2Qu4lWU_NQbyImJwXdWguTnrxKFyAhhzrULHTOEnI_w/exec';

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Required field validation
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });

      if (!valid) {
        responseEl.textContent =
          'Please complete all required fields before submitting.';
        responseEl.style.color = '#c0392b';
        return;
      }

      // Local date limit check (optional)
      const bookingDate = form.querySelector('#date').value;
      if (bookingDate) {
        const stored = localStorage.getItem('ts_helping_hands_bookings');
        let bookings = stored ? JSON.parse(stored) : {};
        const countForDate = bookings[bookingDate] || 0;

        if (countForDate >= MAX_BOOKINGS_PER_DAY) {
          responseEl.style.color = '#c0392b';
          responseEl.textContent =
            'Sorry, we are already booked on this date. Please choose another day.';
          responseEl.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        bookings[bookingDate] = countForDate + 1;
        localStorage.setItem(
          'ts_helping_hands_bookings',
          JSON.stringify(bookings)
        );
      }

      // Collect form data
      const formData = {
        name: form.querySelector('#name').value.trim(),
        email: form.querySelector('#email').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        address: form.querySelector('#address').value.trim(),
        service: form.querySelector('#service').value,
        date: form.querySelector('#date').value,
        time: form.querySelector('#time').value,

        // FIXED: backend expects "notes", not "details"
        notes: form.querySelector('#details').value.trim(),
      };

      // Send to Google Sheets backend
      try {
        const req = await fetch(sheetScriptURL, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await req.json();

        if (result.ok) {
          responseEl.style.color = '#3b6f44';
          responseEl.textContent = result.message;
        } else {
          responseEl.style.color = '#c0392b';
          responseEl.textContent = result.message;
        }
      } catch (err) {
        responseEl.style.color = '#c0392b';
        responseEl.textContent =
          'Network error. Please try again later.';
      }

      form.reset();
      responseEl.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

});
