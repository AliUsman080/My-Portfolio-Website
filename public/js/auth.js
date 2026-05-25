document.addEventListener('DOMContentLoaded', () => {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    });
  }

  if (getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Signing in...';

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginForm.email.value.trim(),
          password: loginForm.password.value,
        }),
      });
      setAuth(data.token, data.user);
      showToast(data.message, 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'admin' ? 'dashboard.html' : 'index.html';
      }, 800);
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Creating account...';

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: registerForm.name.value.trim(),
          email: registerForm.email.value.trim(),
          password: registerForm.password.value,
        }),
      });
      setAuth(data.token, data.user);
      showToast(data.message, 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    } catch (err) {
      showToast(err.message || err.errors?.[0]?.msg || 'Registration failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
});
