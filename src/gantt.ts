import { GanttTask } from "./data";

const DAY_WIDTH = 32;
const ROW_HEIGHT = 44;
const LEFT_WIDTH = 270;

export function getTaskPosition(
    startDate: string,
    endDate: string,
    chartStartDate: string
): { left: number; width: number } {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const chartStart = parseDate(chartStartDate);

    const left = Math.floor(
        (start.getTime() - chartStart.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const width =
        Math.ceil(
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

    return { left, width };
}

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);

    return new Date(Date.UTC(year, month - 1, day));
}

function buildRowBg(
    totalDays: number,
    chartStartDate: Date
): string {
    const stops: string[] = [];

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(chartStartDate);

        date.setUTCDate(date.getUTCDate() + i);

        const dow = date.getUTCDay();

        if (dow === 0 || dow === 6) {
            const left = i * DAY_WIDTH;

            stops.push(
                `transparent ${left}px`,
                `#f3f4f6 ${left}px`,
                `#f3f4f6 ${left + DAY_WIDTH - 1}px`,
                `#e5e7eb ${left + DAY_WIDTH - 1}px`,
                `#e5e7eb ${left + DAY_WIDTH}px`,
                `transparent ${left + DAY_WIDTH}px`
            );
        }
    }

    const gridGradient = `
        repeating-linear-gradient(
            90deg,
            transparent,
            transparent ${DAY_WIDTH - 1}px,
            #e5e7eb ${DAY_WIDTH - 1}px,
            #e5e7eb ${DAY_WIDTH}px
        )
    `;

    if (stops.length === 0) {
        return `background-image:${gridGradient};`;
    }

    const weekendGradient = `
        linear-gradient(
            90deg,
            ${stops.join(",")}
        )
    `;

    return `
        background-image:${weekendGradient},${gridGradient};
    `;
}

export function renderGantt(tasks: GanttTask[]): string {
    const chartStartDate = tasks.reduce((earliest, task) => {
        const taskStart = parseDate(task.startDate);

        return taskStart < earliest
            ? taskStart
            : earliest;
    }, parseDate(tasks[0].startDate));

    chartStartDate.setUTCDate(
        chartStartDate.getUTCDate() - 7
    );

    const chartStartDateStr = `${chartStartDate.getUTCFullYear()}-${String(
        chartStartDate.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
        chartStartDate.getUTCDate()
    ).padStart(2, "0")}`;

    const chartEndDate = tasks.reduce((latest, task) => {
        const taskEnd = parseDate(task.endDate);

        return taskEnd > latest
            ? taskEnd
            : latest;
    }, parseDate(tasks[0].endDate));

    chartEndDate.setUTCDate(
        chartEndDate.getUTCDate() + 7
    );

    const chartEndDateStr = `${chartEndDate.getUTCFullYear()}-${String(
        chartEndDate.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
        chartEndDate.getUTCDate()
    ).padStart(2, "0")}`;

    const totalDays =
        Math.ceil(
            (parseDate(chartEndDateStr).getTime() -
                parseDate(chartStartDateStr).getTime()) /
                (1000 * 60 * 60 * 24)
        ) + 1;

    const stages = Array.from(
        new Set(tasks.map(task => task.stage))
    );

    const timelineWidth = totalDays * DAY_WIDTH;

    const rowBg = buildRowBg(
        totalDays,
        chartStartDate
    );

    /* ---------------- HEADER ---------------- */

    let monthHtml = `
        <div
            class="flex bg-[#f8fafc]"
            style="width:${timelineWidth}px"
        >
    `;

    let dayHtml = `
        <div
            class="flex bg-[#f8fafc]"
            style="width:${timelineWidth}px"
        >
    `;

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(chartStartDate);

        date.setUTCDate(date.getUTCDate() + i);

        const day = date.getUTCDate();

        const month = date.toLocaleString("uk", {
            month: "long",
            timeZone: "UTC",
        });

        const year = date.getUTCFullYear();

        if (i === 0 || day === 1) {
            let daysInMonth = 0;

            for (let j = i; j < totalDays; j++) {
                const d = new Date(chartStartDate);

                d.setUTCDate(d.getUTCDate() + j);

                if (
                    d.getUTCMonth() !==
                    date.getUTCMonth()
                ) {
                    break;
                }

                daysInMonth++;
            }

            monthHtml += `
                <div
                    style="
                        width:${daysInMonth * DAY_WIDTH}px
                    "
                    class="
                        h-10
                        flex
                        items-center
                        justify-center
                        text-[12px]
                        font-semibold
                        border-r
                        border-b
                        border-[#dbe1e8]
                        capitalize
                        text-[#98a2b3]
                    "
                >
                    ${month} ${year}
                </div>
            `;
        }

        const isToday =
            date.getTime() ===
            new Date(
                Date.UTC(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate()
                )
            ).getTime();

        dayHtml += `
            <div
                class="
                    flex
                    items-center
                    justify-center
                    border-r
                    border-b
                    border-[#dbe1e8]
                    text-[12px]
                    ${
                        isToday
                            ? "text-black font-bold"
                            : "text-[#98a2b3]"
                    }
                "
                style="
                    width:${DAY_WIDTH}px;
                    height:40px;
                "
            >
                ${day}
            </div>
        `;
    }

    monthHtml += "</div>";
    dayHtml += "</div>";

    const rightHeaderHtml =
        monthHtml + dayHtml;

    const leftHeaderHtml = `
        <div
            class="
                flex
                flex-col
                justify-center
                h-20
                px-4
            "
        >
            <div
                class="
                    uppercase
                    text-[12px]
                    font-semibold
                    text-[#98a2b3]
                "
            >
                ЕТАП
            </div>

            <div
                class="
                    text-[13px]
                    text-[#667085]
                    mt-1
                "
            >
                Відповідальний / Виріб
            </div>
        </div>
    `;

    /* ---------------- TODAY LINE ---------------- */

    const today = new Date();

    const todayUTC = new Date(
        Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )
    );

    const todayOffset = Math.floor(
        (todayUTC.getTime() -
            chartStartDate.getTime()) /
            (1000 * 60 * 60 * 24)
    );

    const todayLineLeft =
        todayOffset * DAY_WIDTH +
        DAY_WIDTH / 2;

    /* ---------------- BODY ---------------- */

    let leftHtml = `
        <div
            class="flex flex-col"
            style="
                width:${LEFT_WIDTH}px;
                min-width:${LEFT_WIDTH}px;
            "
        >
    `;

    let rightHtml = `
        <div style="width:${timelineWidth}px">
            <div
                class="relative flex flex-col"
                style="isolation:isolate;"
            >
    `;

    if (
        todayOffset >= 0 &&
        todayOffset < totalDays
    ) {
        rightHtml += `
            <div
                class="
                    absolute
                    top-0
                    bottom-0
                    w-[2px]
                    bg-[#2b2f38]
                    pointer-events-none
                    z-20
                "
                style="
                    left:${todayLineLeft}px;
                "
            ></div>
        `;
    }

    stages.forEach(stage => {
        /* ---------------- STAGE ---------------- */

        leftHtml += `
            <div
                class="
                    flex
                    items-center
                    font-bold
                    cursor-pointer
                    border-b
                    border-[#dbe1e8]
                    px-4
                    uppercase
                    bg-[#fafafa]
                    text-[#1f2937]
                    text-[15px]
                "
                style="
                    height:${ROW_HEIGHT}px
                "
                data-toggle="stage"
                data-stage="${stage}"
            >
                <div
                    class="
                        collapse-icon
                        mr-3
                        w-5
                        h-5
                        rounded
                        border
                        border-[#d0d5dd]
                        flex
                        items-center
                        justify-center
                        text-[#667085]
                        text-[12px]
                    "
                >
                    −
                </div>

                ${stage}
            </div>
        `;

        rightHtml += `
            <div
                class="
                    border-b
                    border-[#dbe1e8]
                "
                style="
                    height:${ROW_HEIGHT}px;
                    ${rowBg}
                "
            ></div>
        `;

        const assignees = Array.from(
            new Set(
                tasks
                    .filter(
                        t => t.stage === stage
                    )
                    .map(t => t.assignee)
            )
        );

        assignees.forEach(assignee => {
            /* ---------------- ASSIGNEE ---------------- */

            leftHtml += `
                <div
                    class="
                        flex
                        items-center
                        pl-5
                        font-semibold
                        cursor-pointer
                        border-b
                        border-[#dbe1e8]
                        capitalize
                        text-[#344054]
                        text-[14px]
                    "
                    style="
                        height:${ROW_HEIGHT}px
                    "
                    data-toggle="assignee"
                    data-stage="${stage}"
                    data-assignee="${assignee}"
                >
                    <div
                        class="
                            mr-3
                            w-6
                            h-6
                            rounded-full
                            bg-[#dbeafe]
                            border
                            border-[#bfdbfe]
                            flex
                            items-center
                            justify-center
                            text-[#2563eb]
                            text-[11px]
                            font-semibold
                            shrink-0
                        "
                    >
                        ${assignee.charAt(0).toUpperCase()}
                    </div>

                    ${assignee}
                </div>
            `;

            rightHtml += `
                <div
                    class="
                        border-b
                        border-[#dbe1e8]
                    "
                    data-stage="${stage}"
                    style="
                        height:${ROW_HEIGHT}px;
                        ${rowBg}
                    "
                ></div>
            `;

            tasks
                .filter(
                    t =>
                        t.stage === stage &&
                        t.assignee === assignee
                )
                .forEach(task => {
                    leftHtml += `
                        <div
                            class="
                                flex
                                items-center
                                pl-10
                                border-b
                                border-[#dbe1e8]
                                text-[14px]
                                text-[#2563eb]
                            "
                            style="
                                height:${ROW_HEIGHT}px
                            "
                            data-stage="${stage}"
                            data-assignee="${assignee}"
                        >
                            <span
                                class="
                                    mr-3
                                    text-[#98a2b3]
                                    text-[18px]
                                "
                            >
                                °
                            </span>

                            ${task.title}
                        </div>
                    `;

                    const { left, width } =
                        getTaskPosition(
                            task.startDate,
                            task.endDate,
                            chartStartDateStr
                        );

                    rightHtml += `
                        <div
                            class="
                                relative
                                border-b
                                border-[#dbe1e8]
                            "
                            data-stage="${stage}"
                            data-assignee="${assignee}"
                            style="
                                height:${ROW_HEIGHT}px;
                                ${rowBg}
                            "
                        >
                            <div
                                class="
                                    absolute
                                    rounded-full
                                    bg-[#145af2]
                                    shadow-sm
                                "
                                style="
                                    top:10px;
                                    left:${
                                        left *
                                            DAY_WIDTH +
                                        4
                                    }px;
                                    width:${
                                        width *
                                            DAY_WIDTH -
                                        8
                                    }px;
                                    height:24px;
                                "
                            ></div>
                        </div>
                    `;
                });
        });
    });

    leftHtml += "</div>";
    rightHtml += "</div></div>";

    /* ---------------- FINAL ---------------- */

    return `
        <div
            class="
                flex
                flex-col
                border
                border-[#dbe1e8]
                rounded-xl
                bg-white
            "
        >
            <div
                class="
                    flex
                    sticky
                    top-0
                    z-50
                    bg-[#f8fafc]
                    text-[#98a2b3]
                    border-b
                    border-[#dbe1e8]
                "
            >
                <div
                    class="
                        border-r
                        border-[#dbe1e8]
                    "
                    style="
                        width:${LEFT_WIDTH}px;
                        min-width:${LEFT_WIDTH}px;
                    "
                >
                    ${leftHeaderHtml}
                </div>

                <div
                    class="
                        header-scroll
                        overflow-hidden
                        flex-1
                    "
                >
                    <div style="width:max-content">
                        ${rightHeaderHtml}
                    </div>
                </div>
            </div>

            <div class="flex">
                <div
                    class="
                        border-r
                        border-[#dbe1e8]
                    "
                    style="
                        width:${LEFT_WIDTH}px;
                        min-width:${LEFT_WIDTH}px;
                    "
                >
                    ${leftHtml}
                </div>

                <div
                    class="
                        overflow-x-auto
                        body-scroll
                        flex-1
                    "
                >
                    ${rightHtml}
                </div>
            </div>
        </div>
    `;
}