package com.formcraft.exception;

import org.springframework.http.HttpStatus;

public class AiProtocolException extends FormCraftException {
    public AiProtocolException(String message) {
        super(HttpStatus.SERVICE_UNAVAILABLE, message);
    }
}
