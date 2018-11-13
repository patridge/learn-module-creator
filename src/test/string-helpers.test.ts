import * as assert from 'assert';

import StringHelpers from "../string-helpers";

suite("string-helper Tests", function () {
    test("convertToLearnId swaps spaced for hyphens and strips punctuation", function() {
        const testValue = "This is a short, helpful module!";
        const expectedValue = "this-is-a-short-helpful-module";
        const actualValue = StringHelpers.convertToLearnId(testValue);
        assert.equal(expectedValue, actualValue);
    });
    test("convertToLearnId lower-cases any capitalization", function() {
        const testValue = "This extension uses TypeScript and Handlebars";
        const expectedValue = "this-extension-uses-typescript-and-handlebars";
        const actualValue = StringHelpers.convertToLearnId(testValue);
        assert.equal(expectedValue, actualValue);
    });
    test("convertToLearnId removes any leading or trailing spaces", function() {
        const testValue = "  Someone put too many spaces in this name    ";
        const expectedValue = "someone-put-too-many-spaces-in-this-name";
        const actualValue = StringHelpers.convertToLearnId(testValue);
        assert.equal(expectedValue, actualValue);
    });
});