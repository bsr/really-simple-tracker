import chalk from "chalk";
import terminalSize from "term-size";
import { default as cal } from "calendar-js";
import { table, getBorderCharacters } from "table";
import { default as colors } from "colors/safe.js";

import { getThings } from "./thing.js";

import { sub, isDate, isSameDay, differenceInCalendarMonths } from "date-fns";
import { parseDate } from "./utils.js";

function calendar(size, date, data) {}

const transformFunctions = {
    none: (day) => {
        return day;
    },
    compact: (day) => {
        let output = day.day.toString();
        if (day.things.length > 0) {
            output = colors.brightRed(day.day.toString());
        }
        return `${output}`;
    },
    calendar: (day) => {
        let num = colors.grey(day.things.length.toString());
        if (day.things.length > 0) {
            num = colors.brightRed(day.things.length.toString());
        }

        return `${day.day}\n${num}`;
    },
};

const outputFunctions = {
    none: (outputData) => {
        console.log(outputData.calendar);
    },
    compact: (outputData) => {
        let calendarOptions = {
            border: getBorderCharacters("void"),
            header: { alignment: "center", content: outputData.month },
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 1,
                alignment: "center",
            },
            drawHorizontalLine: () => false,
        };

        let outputCalendar = [...outputData.calendar];

        outputCalendar.unshift(outputData.weekdaysAbbr);

        console.log(table(outputCalendar, calendarOptions));
    },
    calendar: (outputData) => {
        let calendarOptions = {
            border: getBorderCharacters("ramac"),
            header: { alignment: "center", content: outputData.month },
            columnDefault: {
                alignment: "center",
            },
        };

        let outputCalendar = [...outputData.calendar];

        outputCalendar.unshift(outputData.weekdaysAbbr);

        console.log(table(outputCalendar, calendarOptions));
    },
};

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
        return transformFunctions[options.format](day);
    };
}

async function show(thing, rawOptions) {
    let options = parseOptions(rawOptions);
    let things = await getThings(thing, options);
    console.log("options:", options);
    // console.log(things);
    if (
        !transformFunctions[options.format] ||
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

    let calendar = cal().detailed(
        endDate.getFullYear(),
        endDate.getMonth(),
        getDayTransformer(things, options),
    );

    outputFunctions[options.format](calendar);
}

export { show };
