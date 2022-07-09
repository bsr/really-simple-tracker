import chalk from "chalk";
import terminalSize from "term-size";
import { default as cal } from "calendar-js";
import { getThings } from "./thing.js";

import { sub, isDate, differenceInCalendarMonths } from "date-fns";
import { parseDate } from "./utils.js";

function calendar(size, date, data) {}

function getDayTransformer(style) {
    // switch (style) {
    // }
}

const transformFunctions = {
    none: (day) => {
        return day;
    },
    compact: (day) => {
        return day;
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

async function show(thing, rawOptions) {
    let options = parseOptions(rawOptions);
    let things = await getThings(thing, options);
    console.log("options:", options);
    console.log(things);

    let startDate = new Date();
    let endDate = startDate;

    if (things.length > 0) {
        startDate = things[0].timestamp;
        endDate = [...things].pop().timestamp;
    }
    let years = endDate.getFullYear() - startDate.getFullYear() + 1;
    let months = differenceInCalendarMonths(endDate, startDate) + 1;
    console.log("years", years);
    console.log("months", months);

    let calendar = cal().detailed(endDate.getFullYear(), endDate.getMonth());
    console.log("calendar", calendar.calendar);
}

export { show };
