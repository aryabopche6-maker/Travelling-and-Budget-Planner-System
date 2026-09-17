package com.wanderplan.exception;


import java.time.LocalDateTime;

public class ErrorResponse {
    private boolean success;
    private String message;
    private LocalDateTime timestamp;
    private int status;

    public ErrorResponse() {}

    public ErrorResponse(boolean success, String message, LocalDateTime timestamp, int status) {
        this.success = success;
        this.message = message;
        this.timestamp = timestamp;
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public static ErrorResponseBuilder builder() {
        return new ErrorResponseBuilder();
    }

    public static class ErrorResponseBuilder {
        private boolean success;
        private String message;
        private LocalDateTime timestamp;
        private int status;

        public ErrorResponseBuilder() {}

        public ErrorResponseBuilder success(boolean success) {
            this.success = success;
            return this;
        }

        public ErrorResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public ErrorResponseBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ErrorResponseBuilder status(int status) {
            this.status = status;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(this.success, this.message, this.timestamp, this.status);
        }
    }

}
