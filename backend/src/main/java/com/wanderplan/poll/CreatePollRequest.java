package com.wanderplan.poll;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreatePollRequest {
    @NotBlank(message = "Poll title is required")
    private String title;

    private String category;
    private Boolean isAnonymous;

    @NotEmpty(message = "Poll options cannot be empty")
    private List<String> options;

    public CreatePollRequest() {}

    public CreatePollRequest(String title, String category, Boolean isAnonymous, List<String> options) {
        this.title = title;
        this.category = category;
        this.isAnonymous = isAnonymous;
        this.options = options;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean isAnonymous() {
        return isAnonymous;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

}
