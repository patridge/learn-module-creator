export function validateNonEmpty(title?: string) : string | undefined {
    if ((title || "").length === 0) {
        return "Value cannot be empty.";
    }
    return undefined;
}

export function validatePublishDateString(dateString?: string) : string | undefined {
    const regex = /[0-1][0-9]\/[0-3][0-9]\/[0-9][0-9][0-9][0-9]/g;
    if (!regex.test(dateString || "")) {
        return "Date must be in the form of 'MM/dd/yyyy'.";
    }
    return undefined;
}