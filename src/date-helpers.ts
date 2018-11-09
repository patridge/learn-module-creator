import StringHelpers from "./string-helpers";

export default class DateHelpers {
    public static getDateString(date: Date): string {
        let month = date.getMonth() + 1; // because JavaScript reasons (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth)
        let day = date.getDate();
        let year = date.getFullYear();
        const defaultDateString =
            StringHelpers.leftPad(month.toString(), "0", 2)
            + "/" + StringHelpers.leftPad(day.toString(), "0", 2)
            + "/" + year.toString();
        return defaultDateString;
    }
}