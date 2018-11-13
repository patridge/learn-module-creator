export default class StringHelpers {
    public static leftPad(source: string, pad: string, length: number) {
        let paddedResult = source + ""; // Make sure it's really a string.
        while (paddedResult.length < length) {
            paddedResult = pad + paddedResult;
        }
        return paddedResult;
    }
    public static convertToLearnId(name: string): string {
        // 1. Strip out characters that probably shouldn't be in a filename.
        // 2. Make it lowercase.
        // 3. Replace spaces with hyphens.
        return name.replace(/[`~!@#$%^&*()_=+\[\]{}\\|;:"',.<>/?]/g, "").toLowerCase().trim().replace(/ /g, '-');
    }
}