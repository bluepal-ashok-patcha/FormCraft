package com.formcraft.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class CommunicationException extends RuntimeException {
    public CommunicationException(String message) {
        super(message);
    }
}
