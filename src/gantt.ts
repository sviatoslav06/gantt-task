import { GanttTask } from "./data";

export function getTaskPosition(
    startDate: string,
    endDate: string,
    chartStartDate: string
) : { left: number; width: number } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const chartStart = new Date(chartStartDate);

    const left = Math.floor((start.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24));
    const width = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return { left, width };
}

export function renderGantt(tasks: GanttTask[]): string {
    const chartStartDate = tasks.reduce((earliest, task) => {
        const taskStart = new Date(task.startDate);
        return taskStart < earliest ? taskStart : earliest;
    }, new Date(tasks[0].startDate)).toISOString().split('T')[0];

    const stages = Array.from(new Set(tasks.map(task => task.stage)));

    let html = '<div class="gantt-chart">';
    html += '<div class="gantt-header"><div class="gantt-stage">Stage</div><div class="gantt-timeline">Timeline</div></div>';

    stages.forEach(stage => {
        html += `<div class="gantt-row"><div class="gantt-stage">${stage}</div><div class="gantt-timeline">`;
        tasks.filter(task => task.stage === stage).forEach(task => {
            const { left, width } = getTaskPosition(task.startDate, task.endDate, chartStartDate);
            html += `<div class="gantt-task absolute" style="left: ${left * 32}px; width: ${width * 32}px;">${task.title}</div>`;
        });
        html += '</div></div>';
    });

    html += '</div>';
    return html;
}