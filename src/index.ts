import { ganttData } from './data.js';
import { renderGantt } from './gantt.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = renderGantt(ganttData);
  }
});