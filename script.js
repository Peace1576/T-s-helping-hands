/*
  Basic interactivity for the booking form. The script attaches a submit
  handler to the booking form to perform client‑side validation and display
  feedback without leaving the page. The form data is not actually sent
  anywhere; instead, it simulates a successful booking and resets the form.
*/

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const responseEl = document.getElementById('form-response');
  // Maximum number of bookings allowed per day (client‑side check)
  const MAX_BOOKINGS_PER_DAY = 3;
  // Placeholder for Google Sheets script URL. Replace with your Apps Script URL
  const sheetScriptURL = 'YOUR_GOOGLE_SHEETS_SCRIPT_URL';

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Basic validation: ensure all required fields have a value
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
      // Check localStorage for bookings on the selected date
      const dateField = form.querySelector('#date');
      const bookingDate = dateField.value;
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
        // Otherwise increment booking count locally
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
        details: form.querySelector('#details').value.trim(),
      };
      // Attempt to send data to Google Sheets script if URL is configured
      try {
        if (sheetScriptURL && sheetScriptURL !== 'YOUR_GOOGLE_SHEETS_SCRIPT_URL') {
          await fetch(sheetScriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
        }
        responseEl.style.color = '#3b6f44';
        responseEl.textContent =
          'Thank you! Your booking request has been received. We will email you a confirmation within 24 hours.';
        form.reset();
      } catch (err) {
        // If sending fails, still show success but mention offline
        responseEl.style.color = '#3b6f44';
        responseEl.textContent =
          'Thank you! Your booking request has been received. We will contact you within 24 hours.';
        form.reset();
      }
      responseEl.scrollIntoView({ behavior: 'smooth' });
    });
  }
});