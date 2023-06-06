import { buildParams } from "../../utils";
import { expect, describe, it } from "@jest/globals";

describe("Build params", () => {
    it('Should build string without ids or params', () => {
        const expected = "1, ''";
        const result = buildParams();
        expect(result).toBe(expected)
    });
    it('Should build string with student_id but without params', () => {
        const expected = "1, 1, ''";
        const result = buildParams([], true, '1');
        expect(result).toBe(expected)
    })
    it('Should build string with teacher_id but without params', () => {
        const expected = "1, 1, ''";
        const result = buildParams([], false, '', true, '1');
        expect(result).toBe(expected)
    })
    it('Should build string with both ids but without params', () => {
        const expected = "1, 1, 1, ''";
        const result = buildParams([], true, '1', true, '1');
        expect(result).toBe(expected)
    })
    it('Should build string with params and no ids', () => {
        const expected = "test, pass, 123, 1, ''";
        const result = buildParams(['test', 'pass', 123]);
        expect(result).toBe(expected)
    })
    it('Should build string with params and student id', () => {
        const expected = "test, 1, 1, ''";
        const result = buildParams(['test'], true, "1");
        expect(result).toBe(expected)
    })
    it('Should build string with params and teacher id', () => {
        const expected = "test, 1, 1, ''";
        const result = buildParams(['test'], false, '', true, "1");
        expect(result).toBe(expected)
    })
    it('Should build string with params and both ids', () => {
        const expected = "test, 1, 1, 1, ''";
        const result = buildParams(['test'], true, '1', true, "1");
        expect(result).toBe(expected)
    })
});