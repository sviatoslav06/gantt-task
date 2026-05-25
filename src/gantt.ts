import { GanttTask } from "./data";

export function getTaskPosition(
    startDate: string,
    endDate: string,
    chartStartDate: string
) : { left: number; width: number } {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const chartStart = parseDate(chartStartDate);

    const left = Math.floor((start.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24));
    const width = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return { left, width };
}

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

export function renderGantt(tasks: GanttTask[]): string {
    const chartStartDate = tasks.reduce((earliest, task) => {
        const taskStart = parseDate(task.startDate);
        return taskStart < earliest ? taskStart : earliest;
    }, parseDate(tasks[0].startDate));

    chartStartDate.setUTCDate(chartStartDate.getUTCDate() - 7);

    const chartStartDateStr = `${chartStartDate.getUTCFullYear()}-${String(chartStartDate.getUTCMonth() + 1).padStart(2, '0')}-${String(chartStartDate.getUTCDate()).padStart(2, '0')}`;

    const chartEndDate = tasks.reduce((latest, task) => {
        const taskEnd = parseDate(task.endDate);
        return taskEnd > latest ? taskEnd : latest;
    }, parseDate(tasks[0].endDate));

    chartEndDate.setUTCDate(chartEndDate.getUTCDate() + 7);

    const chartEndDateStr = `${chartEndDate.getUTCFullYear()}-${String(chartEndDate.getUTCMonth() + 1).padStart(2, '0')}-${String(chartEndDate.getUTCDate()).padStart(2, '0')}`;
    
    const totalDays = Math.ceil(
        (parseDate(chartEndDateStr).getTime() - parseDate(chartStartDateStr).getTime()) 
        / (1000 * 60 * 60 * 24)
    ) + 1;

    const stages = Array.from(new Set(tasks.map(task => task.stage)));

    const timelineWidth = totalDays * 32;

    let monthHtml = `<div class="flex" style="width:${timelineWidth}px">`;
    let dayHtml = `<div class="flex" style="width:${timelineWidth}px">`;

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(chartStartDate);
        date.setUTCDate(date.getUTCDate() + i);
        
        const day = date.getUTCDate();

        const month = date.toLocaleString('uk', {
            month: 'long',
            timeZone: 'UTC'
        });

        const year = date.getUTCFullYear();

        if (i === 0 || day === 1) {
            let daysInMonth = 0;
            for (let j = i; j < totalDays; j++) {
                const d = new Date(chartStartDate);
                d.setUTCDate(d.getUTCDate() + j);
                if (d.getUTCMonth() !== date.getUTCMonth()) break;
                daysInMonth++;
            }
            monthHtml += `<div style="width: ${daysInMonth * 32}px" class="h-6 flex items-center justify-center text-xs font-semibold border-r border-gray-200 capitalize">${month} ${year}</div>`;        
        }

        dayHtml += `<div class="w-8 h-6 flex items-center justify-center text-xs border-r border-b border-gray-200 text-gray-500">${day}</div>`;
    }

    monthHtml += '</div>';
    dayHtml += '</div>';
    let rightHeaderHtml = monthHtml + dayHtml;

    let leftHeaderHtml = `<div class="flex flex-col h-6 text-gray-500"><div class="uppercase">ЕТАП</div><div class="text-xs">Відповідальний / Виріб</div></div>`;

    let leftHtml = '<div class="flex flex-col" style="width: 200px; min-width: 200px;">';

    let rightHtml = `<div style="width:${timelineWidth}px"><div class="flex flex-col">`;

    stages.forEach(stage => {
        leftHtml += `<div class="h-8 flex items-center font-bold cursor-pointer border-b border-gray-200 px-2 uppercase" data-toggle="stage" data-stage="${stage}">${stage} ▾</div>`;
        rightHtml += `<div class="h-8 border-b border-gray-200" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px);"></div>`;

        const assignees = Array.from(new Set(
        tasks.filter(t => t.stage === stage).map(t => t.assignee)
        ));

        assignees.forEach(assignee => {
            leftHtml += `<div class="h-8 flex items-center pl-4 font-semibold cursor-pointer border-b border-gray-200 capitalize" data-toggle="assignee" data-stage="${stage}" data-assignee="${assignee}">${assignee} ▾</div>`;
            rightHtml += `<div class="h-8 border-b border-gray-200" data-stage="${stage}" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px);"></div>`;

            tasks.filter(t => t.stage === stage && t.assignee === assignee).forEach(task => {
                leftHtml += `<div class="h-8 flex items-center pl-8 border-b border-gray-200 text-sm text-blue-600" data-stage="${stage}" data-assignee="${assignee}">${task.title}</div>`;
                const { left, width } = getTaskPosition(task.startDate, task.endDate, chartStartDateStr);
                rightHtml += `<div class="relative h-8 border-b border-gray-200" data-stage="${stage}" data-assignee="${assignee}" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px);"><div class="absolute rounded bg-blue-500" style="top: 4px; left: ${left * 32}px; width: ${width * 32}px; height: 24px;"></div></div>`;
            });
        });
    });

    leftHtml += '</div>';
    rightHtml += '</div></div>';

    return `<div class="flex flex-col">
        <div class="flex sticky top-0 z-10 bg-gray-100 text-gray-500">
            <div class="border-r border-gray-200 pl-2" style="width:200px; min-width:200px">${leftHeaderHtml}</div>
            <div class="overflow-x-hidden header-scroll">${rightHeaderHtml}</div>
        </div>
        <div class="flex">
            <div class="border-r border-gray-200" style="width:200px; min-width:200px">${leftHtml}</div>
            <div class="overflow-x-auto body-scroll">${rightHtml}</div>
        </div>
    </div>`;
}