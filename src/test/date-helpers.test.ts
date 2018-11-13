import * as assert from 'assert';

import DateHelpers from "../date-helpers";

suite("date-helper Tests", function () {
    test("getDateString returns expected format", function() {
        const testValue = new Date(2018, 10/*month index*/, 12, 18, 17, 25);
        const expectedValue = "11/12/2018";
        const actualValue = DateHelpers.getDateString(testValue);
        assert.equal(expectedValue, actualValue);
    });
});