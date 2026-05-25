const validators = {
  name: (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  },
  email: (value) => {
    if (!value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
    return '';
  },
  subject: (value) => {
    if (!value.trim()) return 'Subject is required';
    if (value.trim().length < 3) return 'Subject must be at least 3 characters';
    return '';
  },
  message: (value) => {
    if (!value.trim()) return 'Message is required';
    if (value.trim().length < 10) return 'Message must be at least 10 characters';
    return '';
  },
};

function showFieldError(input, message) {
  const group = input.closest('.form-group');
  const errorEl = group.querySelector('.error-msg');
  input.classList.toggle('error', !!message);
  input.classList.toggle('success', !message && input.value.trim());
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.toggle('show', !!message);
  }
}

function validateField(input) {
  const rule = validators[input.name];
  if (!rule) return true;
  const error = rule(input.value);
  showFieldError(input, error);
  return !error;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.querySelectorAll('.form-control').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    form.querySelectorAll('.form-control').forEach((input) => {
      if (!validateField(input)) isValid = false;
    });

    if (!isValid) {
      showToast('Please fix the errors before submitting.', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';

    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const data = await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast(data.message, 'success');
      form.reset();
      form.querySelectorAll('.form-control').forEach((input) => {
        input.classList.remove('error', 'success');
      });
    } catch (err) {
      const msg = err.errors?.[0]?.msg || err.message || 'Failed to send message.';
      showToast(msg, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
