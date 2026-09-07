const themeToggle = document.getElementById('themeToggle');

function loadTheme() {
  const savedTheme = localStorage.getItem('novacart_theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');

    if (themeToggle) {
      themeToggle.textContent = '☀️';
    }
  } else {
    document.body.classList.remove('dark-mode');

    if (themeToggle) {
      themeToggle.textContent = '🌙';
    }
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');

    if (isDark) {
      localStorage.setItem('novacart_theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      localStorage.setItem('novacart_theme', 'light');
      themeToggle.textContent = '🌙';
    }
  });
}

loadTheme();