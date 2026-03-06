package com.mednex.mednex_enterprise.module.pharmacy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PharmacyServiceException extends RuntimeException {
    public PharmacyServiceException(String message) {
        super(message);
    }
}
