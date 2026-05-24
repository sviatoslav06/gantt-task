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

    let leftHtml = '<div class="flex flex-col w-64">';
    let rightHtml = '<div class="overflow-x-auto flex-1"><div class="flex flex-col">';

    stages.forEach(stage => {
        leftHtml += `<div class="h-8 flex items-center font-bold">${stage}</div>`;
        rightHtml += `<div class="h-8"></div>`; // порожній рядок для етапу

        tasks.filter(t => t.stage === stage).forEach(task => {
            leftHtml += `<div class="h-8 flex items-center pl-4">${task.title}</div>`;
            const { left, width } = getTaskPosition(task.startDate, task.endDate, chartStartDate);
            rightHtml += `<div class="relative h-8"><div style="position: absolute; top: 4px; left: ${left * 32}px; width: ${width * 32}px; height: 24px; background: blue;"></div></div>`;
        });
    });

    leftHtml += '</div>';
    rightHtml += '</div></div>';

    return `<div class="flex">${leftHtml}${rightHtml}</div>`;
}