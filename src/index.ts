import { ganttData } from './data.js';
import { renderGantt } from './gantt.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    if (!app) return;

    app.innerHTML = renderGantt(ganttData);

    /* ---------------- STAGE COLLAPSE ---------------- */

    app.querySelectorAll('[data-toggle="stage"]').forEach(el => {
        el.addEventListener('click', () => {
            const stage = el.getAttribute('data-stage');

            const rows = app.querySelectorAll(
                `[data-stage="${stage}"]`
            );

            let shouldHide = false;

            rows.forEach(row => {
                if (row === el) return;

                if ((row as HTMLElement).style.display !== 'none') {
                    shouldHide = true;
                }
            });

            rows.forEach(row => {
                if (row === el) return;

                (row as HTMLElement).style.display =
                    shouldHide ? 'none' : '';
            });

            // зміна + / -
            const icon = el.querySelector('.collapse-icon');

            if (icon) {
                icon.textContent = shouldHide ? '+' : '−';
            }
        });
    });

    /* ---------------- ASSIGNEE COLLAPSE ---------------- */

    app.querySelectorAll('[data-toggle="assignee"]').forEach(el => {
        el.addEventListener('click', () => {
            const stage = el.getAttribute('data-stage');

            const assignee =
                el.getAttribute('data-assignee');

            const rows = app.querySelectorAll(
                `[data-stage="${stage}"][data-assignee="${assignee}"]`
            );

            let shouldHide = false;

            rows.forEach(row => {
                if (row === el) return;

                if ((row as HTMLElement).style.display !== 'none') {
                    shouldHide = true;
                }
            });

            rows.forEach(row => {
                if (row === el) return;

                (row as HTMLElement).style.display =
                    shouldHide ? 'none' : '';
            });
        });
    });

    /* ---------------- SCROLL SYNC ---------------- */

    const bodyScroll = app.querySelector(
        '.body-scroll'
    ) as HTMLElement;

    const headerScroll = app.querySelector(
        '.header-scroll'
    ) as HTMLElement;

    bodyScroll.addEventListener('scroll', () => {
        headerScroll.scrollLeft = bodyScroll.scrollLeft;
    });
});