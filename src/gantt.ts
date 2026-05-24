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

    const chartEndDate = tasks.reduce((latest, task) => {
        const taskEnd = new Date(task.endDate);
        return taskEnd > latest ? taskEnd : latest;
    }, new Date(tasks[0].endDate)).toISOString().split('T')[0];

    const totalDays = Math.ceil(
        (new Date(chartEndDate).getTime() - new Date(chartStartDate).getTime()) 
        / (1000 * 60 * 60 * 24)
    );

    const stages = Array.from(new Set(tasks.map(task => task.stage)));

    let headerHtml = '<div class="flex">';
    for (let i = 0; i < totalDays; i++) {
        headerHtml += `<div class="w-8 h-8 flex items-center justify-center text-xs border-r border-gray-200">${i + 1}</div>`;
    }
    headerHtml += '</div>';

    let leftHtml = '<div class="flex flex-col" style="width: 200px; min-width: 200px;">';
    leftHtml += '<div class="h-8"></div>';

    let rightHtml = '<div class="overflow-x-auto flex-1"><div class="flex flex-col">';

    stages.forEach(stage => {
        leftHtml += `<div class="h-8 flex items-center font-bold cursor-pointer" data-toggle="stage" data-stage="${stage}">${stage} ▾</div>`;
        rightHtml += `<div class="h-8"></div>`;

        const assignees = Array.from(new Set(
        tasks.filter(t => t.stage === stage).map(t => t.assignee)
        ));

        assignees.forEach(assignee => {
            leftHtml += `<div class="h-8 flex items-center pl-4 font-semibold cursor-pointer" data-toggle="assignee" data-stage="${stage}" data-assignee="${assignee}">${assignee} ▾</div>`;
            rightHtml += `<div class="h-8" data-stage="${stage}"></div>`;

            tasks.filter(t => t.stage === stage && t.assignee === assignee).forEach(task => {
                leftHtml += `<div class="h-8 flex items-center pl-8" data-stage="${stage}" data-assignee="${assignee}">${task.title}</div>`;
                const { left, width } = getTaskPosition(task.startDate, task.endDate, chartStartDate);
                rightHtml += `<div class="relative h-8" data-stage="${stage}" data-assignee="${assignee}"><div style="position: absolute; top: 4px; left: ${left * 32}px; width: ${width * 32}px; height: 24px; background: blue;"></div></div>`;
            });
        });
    });

    leftHtml += '</div>';
    rightHtml += '</div></div>';

    return `<div class="flex">${leftHtml}<div class="flex-1">${headerHtml}${rightHtml}</div></div>`;
}