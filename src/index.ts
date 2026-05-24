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

    // collapse по етапу
    app.querySelectorAll('[data-toggle="stage"]').forEach(el => {
      el.addEventListener('click', () => {
        const stage = el.getAttribute('data-stage');
        const rows = app.querySelectorAll(`[data-stage="${stage}"]`);
        rows.forEach(row => {
          if (row === el) return;
          const isHidden = (row as HTMLElement).style.display === 'none';
          (row as HTMLElement).style.display = isHidden ? '' : 'none';
        });
      });
    });

    // collapse по відповідальному
    app.querySelectorAll('[data-toggle="assignee"]').forEach(el => {
      el.addEventListener('click', () => {
        const stage = el.getAttribute('data-stage');
        const assignee = el.getAttribute('data-assignee');
        const rows = app.querySelectorAll(`[data-stage="${stage}"][data-assignee="${assignee}"]`);
        rows.forEach(row => {
          if (row === el) return;
          const isHidden = (row as HTMLElement).style.display === 'none';
          (row as HTMLElement).style.display = isHidden ? '' : 'none';
        });
      });
    });
  }
});