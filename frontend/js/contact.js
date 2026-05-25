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
  if (input.type === 'file') return true; // Skip file validation for now
  const rule = validators[input.name];
  if (!rule) return true;
  const error = rule(input.value);
  showFieldError(input, error);
  return !error;
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
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

    try {
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        if (key !== 'attachment') {
          data[key] = value.trim();
        }
      });

      // Handle attachment
      const fileInput = form.querySelector('#attachment');
      if (fileInput && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size exceeds 5MB limit.');
        }
        data.attachment = await fileToBase64(file);
        data.attachmentName = file.name;
      }

      const response = await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      showToast(response.message, 'success');
      form.reset();
      form.querySelectorAll('.form-control').forEach((input) => {
        input.classList.remove('error', 'success');
      });
    } catch (err) {
      console.error('Submission error:', err);
      const msg = err.errors?.[0]?.msg || err.message || 'Failed to send message.';
      showToast(msg, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
