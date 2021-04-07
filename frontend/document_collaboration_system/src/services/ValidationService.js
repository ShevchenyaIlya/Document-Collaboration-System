import ValidationError from "../errors/ValidationError";


export class ValidationService {
    static validateComment = (comment) => {
        if (!comment.match(/^[a-zA-ZА-Яа-я0-9.!,-_ ]{1, 50}$/))
            throw new ValidationError("Invalid middle name");
        return true;
    };

    static validateMessage = (message) => {
        if (!message.match(/^[a-zA-ZА-Яа-я0-9 .,-_?!]{1,100}$/))
            throw new ValidationError("Invalid position");
        return true;
    };

    static validateDocumentName = (document) => {
        if (!document.match(/^[a-zA-ZА-Яа-я0-9 ]{1, 30}$/))
            throw new ValidationError("Invalid middle name");
        return true;
    };

    static validateDocumentId = (identifier) => {
        if (!identifier.match(/^[a-zA-Z0-9]{1, 30}$/))
            throw new ValidationError("Invalid middle name");
        return true;
    };

    static validateUsername = (username) => {
        if (!username.match(/^[a-zA-Z0-9_-]{1,32}$/))
            throw new ValidationError("Invalid username");
        return true;
    };
}

export const fieldValidation = (value, validator) => {
    try {
        return !validator(value);
    } catch (e) {
        return true;
    }
};