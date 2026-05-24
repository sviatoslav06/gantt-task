import { ganttData } from './data.js';
import { renderGantt } from './gantt.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = renderGantt(ganttData);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = renderGantt(ganttData);

    // collapse/expand
    app.querySelectorAll('[data-toggle="stage"]').forEach(el => {
      el.addEventListener('click', () => {
        const stage = el.getAttribute('data-stage');
        const rows = app.querySelectorAll(`[data-stage="${stage}"]`);
        rows.forEach(row => {
          if (row === el) return; // не ховаємо сам заголовок
          const isHidden = (row as HTMLElement).style.display === 'none';
          (row as HTMLElement).style.display = isHidden ? '' : 'none';
        });
      });
    });
  }
});