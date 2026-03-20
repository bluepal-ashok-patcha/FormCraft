package com.formcraft.exception;

import org.springframework.http.HttpStatus;

public class BusinessLogicException extends FormCraftException {
    public BusinessLogicException(String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }
}
