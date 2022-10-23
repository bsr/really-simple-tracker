import chalk from "chalk";
import terminalSize from "term-size";
import { default as cal } from "calendar-js";
import { table, getBorderCharacters } from "table";
import { text, colors, sequence } from "./colors.js";

import { getThings } from "./thing.js";

import { sub, isDate, isSameDay, differenceInCalendarMonths } from "date-fns";
import { parseDate } from "./utils.js";
import _ from "lodash";

const githubColorSequence = sequence(colors.darkgreen, colors.lime, 5);

const transformDayFunctions = {
    none: (day) => {
        return day;
    },
    compact: (day) => {
        let output = day.day.toString();
        if (day.things.length > 0) {
            output = text(colors.red, day.day.toString());
        }
        return `${output}`;
    },
    calendar: (day) => {
        let num = text(colors.grey, day.things.length.toString());
        if (day.things.length > 0) {
            num = text(colors.red, day.things.length.toString());
        }

        return `${day.day}\n${num}`;
    },
    github: (day, options = {}) => {
        // some possible block chars "█", "▇", "▇", "▀", "◾", "◼", "▒", "▓"
        let char = "▩";

        switch (day.things.length) {
            case 0:
                return text(colors.dimgrey, char /*+ " " + day.day*/);
            default:
                let sequenceIndex = day.things.length;
                if (sequenceIndex >= githubColorSequence.length) {
                    sequenceIndex = githubColorSequence.length - 1;
                }
                return text(
                    githubColorSequence[sequenceIndex],
                    char /*+ " " + day.day*/,
                );
        }
    },
};

const outputFunctions = {
    none: (outputData) => {
        outputData.forEach((month) => console.log(month.calendar));
    },
    compact: (outputData) => {
        outputData.forEach((month) => {
            let calendarOptions = {
                border: getBorderCharacters("void"),
                header: { alignment: "center", content: month.month },
                columnDefault: {
                    paddingLeft: 0,
                    paddingRight: 1,
                    alignment: "center",
                },
                drawHorizontalLine: () => false,
            };

            let outputCalendar = [...month.calendar];

            outputCalendar.unshift(month.weekdaysAbbr);

            console.log(table(outputCalendar, calendarOptions));
        });
    },
    calendar: (outputData) => {
        outputData.forEach((month) => {
            let calendarOptions = {
                border: getBorderCharacters("ramac"),
                header: { alignment: "center", content: month.month },
                columnDefault: {
                    alignment: "center",
                },
            };

            let outputCalendar = [...month.calendar];

            outputCalendar.unshift(month.weekdaysAbbr);

            console.log(table(outputCalendar, calendarOptions));
        });
    },
    github: (outputData) => {
        let outputCalendar = outputData[0].calendar;
        let monthColumns = [
            {
                name: outputData[0].monthAbbr,
                position: 1,
                span: outputData[0].calendar.length - 1,
            },
        ];
        for (let month = 1; month < outputData.length; month++) {
            if (
                _.isEqual(
                    [...outputCalendar].pop(),
                    outputData[month].calendar[0],
                )
            ) {
                outputData[month].calendar.shift();
            }

            outputCalendar = [...outputCalendar, ...outputData[month].calendar];
            monthColumns.push({
                name: outputData[month].monthAbbr,
                position:
                    outputCalendar.length - outputData[month].calendar.length,
                span: outputData[month].calendar.length - 1,
            });
        }

        outputCalendar.unshift(["", "Mon", "", "Wed", "", "Fri", ""]);
        outputCalendar = outputCalendar.map((e) => {
            e.unshift("");
            return e;
        });

        monthColumns.forEach((e) => {
            outputCalendar[e.position][0] = e.name;
        });

        // console.log("outputCalendar", outputCalendar);
        outputCalendar = _.unzip(outputCalendar);

        // console.log("outputCalendar", outputCalendar);

        let spanningCells = monthColumns.map((e) => {
            return {
                col: e.position,
                row: 0,
                colSpan: e.span,
                alignment: "left",
            };
        });

        let calendarOptions = {
            border: getBorderCharacters("void"),
            header: { alignment: "center", content: "" },
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 1,
                alignment: "left",
            },
            drawHorizontalLine: () => false,
            spanningCells: spanningCells,
        };

        console.log(table(outputCalendar, calendarOptions));
    },
};

function availableOutputs() {
    return Object.keys(outputFunctions).filter((f) =>
        Object.keys(transformDayFunctions).includes(f),
    );
}

function parseOptions(rawOptions) {
    let options = {};
    options.format = rawOptions.format;
    if (rawOptions.daysSince) {
        if (rawOptions.daysSince < 1) {
            throw new Error("days since should be greater than 1");
        }
        let now = new Date();
        rawOptions.endDate = now.toString();
        rawOptions.startDate = sub(now, {
            years: 0,
            months: 0,
            weeks: 0,
            days: rawOptions.daysSince,
            hours: 0,
            minutes: 0,
            seconds: 0,
        }).toString();
    }

    if (rawOptions.startDate) {
        options.startDate = parseDate(rawOptions.startDate);
        if (!options.startDate) {
            throw new Error("invalid start date");
        }
    }

    if (rawOptions.endDate) {
        options.endDate = parseDate(rawOptions.endDate);
        if (!options.endDate) {
            throw new Error("invalid end date");
        }
    }

    return options;
}

function getDayTransformer(things, options) {
    return function (day) {
        day.things = things.filter((e) => {
            return isSameDay(e.timestamp, day.date);
        });
        return transformDayFunctions[options.format](day, options);
    };
}

async function show(thing, rawOptions) {
    let options = parseOptions(rawOptions);
    let things = await getThings(thing, options);
    // console.log("options:", options);
    // console.log(things);
    if (
        !transformDayFunctions[options.format] ||
        !outputFunctions[options.format]
    ) {
        throw new Error(`invalid output option "${options.format}"`);
    }

    let startDate = new Date();
    let endDate = startDate;

    if (things.length > 0) {
        startDate = things[0].timestamp;
        endDate = [...things].pop().timestamp;
    }
    let years = endDate.getFullYear() - startDate.getFullYear() + 1;
    let months = differenceInCalendarMonths(endDate, startDate) + 1;
    // console.log("years", years);
    // console.log("months", months);

    let calendars = [];
    for (let year = 0; year < years; year++) {
        let yearValue = startDate.getFullYear() + year;
        for (let month = 0; month < months; month++) {
            let monthValue = (startDate.getMonth() + month) % 12;
            let calendar = cal().detailed(
                yearValue,
                monthValue,
                getDayTransformer(things, options),
            );
            calendars.push(calendar);
        }
    }

    outputFunctions[options.format](calendars);
}

function getMaxThingsPerDay(things) {}

export { show, availableOutputs };
