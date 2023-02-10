export const TIME = {
    SECONDS: 1000,
    MINUTES: 1000 * 60,
    HOURS:   1000 * 60 * 60,
    DAYS:    1000 * 60 * 60 * 24,
};
export const PASSWORD_MIN_LENGTH = 3;

// const REG_PATT_NUMBER = new RegExp("\b[0-9]");
export const REGEX_FIRST_NOT_DIGIT = /\b[0-9]/;
export const MESSAGES = {
    USERNAME:{
        NOT_EMPTY: 0,
        MIN_LENGTH: 1,
        FIRST_NOT_DIGIT: 2,
        size: 3,
    },
    EMAIL:{
        NOT_EMPTY: 0,
        IS_EMAIL: 1,
        size: 2,
    },
    PASSWORD:{
        NOT_EMPTY: 0,
        MIN_LENGTH: 1,
        NOT_MATCH: 1,
        size: 3,
    },
};

export const ERROR_CODE = {
    EMPTY: 0x1,
    NOT_VALID: 0x2,
    LEN: 0x4,
    UNIQUE: 0x8,
    EMAIL:0x10,
    PWD:0x20,
};
