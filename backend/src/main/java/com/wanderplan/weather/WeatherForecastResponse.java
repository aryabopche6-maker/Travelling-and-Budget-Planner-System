package com.wanderplan.weather;

import java.util.List;

public class WeatherForecastResponse {
    private String destination;
    private Double currentTemperature;
    private String currentCondition;
    private Integer rainProbability;
    private Double windSpeed;
    private List<DailyForecastDto> dailyForecasts;
    private List<WeatherConflictDto> weatherConflicts;

    public WeatherForecastResponse() {}

    public WeatherForecastResponse(String destination, Double currentTemperature, String currentCondition, Integer rainProbability, Double windSpeed, List<DailyForecastDto> dailyForecasts, List<WeatherConflictDto> weatherConflicts) {
        this.destination = destination;
        this.currentTemperature = currentTemperature;
        this.currentCondition = currentCondition;
        this.rainProbability = rainProbability;
        this.windSpeed = windSpeed;
        this.dailyForecasts = dailyForecasts;
        this.weatherConflicts = weatherConflicts;
    }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getCurrentTemperature() { return currentTemperature; }
    public void setCurrentTemperature(Double currentTemperature) { this.currentTemperature = currentTemperature; }

    public String getCurrentCondition() { return currentCondition; }
    public void setCurrentCondition(String currentCondition) { this.currentCondition = currentCondition; }

    public Integer getRainProbability() { return rainProbability; }
    public void setRainProbability(Integer rainProbability) { this.rainProbability = rainProbability; }

    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

    public List<DailyForecastDto> getDailyForecasts() { return dailyForecasts; }
    public void setDailyForecasts(List<DailyForecastDto> dailyForecasts) { this.dailyForecasts = dailyForecasts; }

    public List<WeatherConflictDto> getWeatherConflicts() { return weatherConflicts; }
    public void setWeatherConflicts(List<WeatherConflictDto> weatherConflicts) { this.weatherConflicts = weatherConflicts; }

    public static WeatherForecastResponseBuilder builder() {
        return new WeatherForecastResponseBuilder();
    }

    public static class WeatherForecastResponseBuilder {
        private String destination;
        private Double currentTemperature;
        private String currentCondition;
        private Integer rainProbability;
        private Double windSpeed;
        private List<DailyForecastDto> dailyForecasts;
        private List<WeatherConflictDto> weatherConflicts;

        public WeatherForecastResponseBuilder destination(String destination) { this.destination = destination; return this; }
        public WeatherForecastResponseBuilder currentTemperature(Double currentTemperature) { this.currentTemperature = currentTemperature; return this; }
        public WeatherForecastResponseBuilder currentCondition(String currentCondition) { this.currentCondition = currentCondition; return this; }
        public WeatherForecastResponseBuilder rainProbability(Integer rainProbability) { this.rainProbability = rainProbability; return this; }
        public WeatherForecastResponseBuilder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public WeatherForecastResponseBuilder dailyForecasts(List<DailyForecastDto> dailyForecasts) { this.dailyForecasts = dailyForecasts; return this; }
        public WeatherForecastResponseBuilder weatherConflicts(List<WeatherConflictDto> weatherConflicts) { this.weatherConflicts = weatherConflicts; return this; }

        public WeatherForecastResponse build() {
            return new WeatherForecastResponse(destination, currentTemperature, currentCondition, rainProbability, windSpeed, dailyForecasts, weatherConflicts);
        }
    }

    public static class DailyForecastDto {
        private String date;
        private Double tempMax;
        private Double tempMin;
        private String condition;
        private Integer rainProbability;
        private String icon;

        public DailyForecastDto() {}

        public DailyForecastDto(String date, Double tempMax, Double tempMin, String condition, Integer rainProbability, String icon) {
            this.date = date;
            this.tempMax = tempMax;
            this.tempMin = tempMin;
            this.condition = condition;
            this.rainProbability = rainProbability;
            this.icon = icon;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public Double getTempMax() { return tempMax; }
        public void setTempMax(Double tempMax) { this.tempMax = tempMax; }

        public Double getTempMin() { return tempMin; }
        public void setTempMin(Double tempMin) { this.tempMin = tempMin; }

        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }

        public Integer getRainProbability() { return rainProbability; }
        public void setRainProbability(Integer rainProbability) { this.rainProbability = rainProbability; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public static DailyForecastDtoBuilder builder() {
            return new DailyForecastDtoBuilder();
        }

        public static class DailyForecastDtoBuilder {
            private String date;
            private Double tempMax;
            private Double tempMin;
            private String condition;
            private Integer rainProbability;
            private String icon;

            public DailyForecastDtoBuilder date(String date) { this.date = date; return this; }
            public DailyForecastDtoBuilder tempMax(Double tempMax) { this.tempMax = tempMax; return this; }
            public DailyForecastDtoBuilder tempMin(Double tempMin) { this.tempMin = tempMin; return this; }
            public DailyForecastDtoBuilder condition(String condition) { this.condition = condition; return this; }
            public DailyForecastDtoBuilder rainProbability(Integer rainProbability) { this.rainProbability = rainProbability; return this; }
            public DailyForecastDtoBuilder icon(String icon) { this.icon = icon; return this; }

            public DailyForecastDto build() {
                return new DailyForecastDto(date, tempMax, tempMin, condition, rainProbability, icon);
            }
        }
    }

    public static class WeatherConflictDto {
        private String date;
        private String activityTitle;
        private String warningMessage;
        private String suggestedAlternative;
        private Double budgetImpact;

        public WeatherConflictDto() {}

        public WeatherConflictDto(String date, String activityTitle, String warningMessage, String suggestedAlternative, Double budgetImpact) {
            this.date = date;
            this.activityTitle = activityTitle;
            this.warningMessage = warningMessage;
            this.suggestedAlternative = suggestedAlternative;
            this.budgetImpact = budgetImpact;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getActivityTitle() { return activityTitle; }
        public void setActivityTitle(String activityTitle) { this.activityTitle = activityTitle; }

        public String getWarningMessage() { return warningMessage; }
        public void setWarningMessage(String warningMessage) { this.warningMessage = warningMessage; }

        public String getSuggestedAlternative() { return suggestedAlternative; }
        public void setSuggestedAlternative(String suggestedAlternative) { this.suggestedAlternative = suggestedAlternative; }

        public Double getBudgetImpact() { return budgetImpact; }
        public void setBudgetImpact(Double budgetImpact) { this.budgetImpact = budgetImpact; }

        public static WeatherConflictDtoBuilder builder() {
            return new WeatherConflictDtoBuilder();
        }

        public static class WeatherConflictDtoBuilder {
            private String date;
            private String activityTitle;
            private String warningMessage;
            private String suggestedAlternative;
            private Double budgetImpact;

            public WeatherConflictDtoBuilder date(String date) { this.date = date; return this; }
            public WeatherConflictDtoBuilder activityTitle(String activityTitle) { this.activityTitle = activityTitle; return this; }
            public WeatherConflictDtoBuilder warningMessage(String warningMessage) { this.warningMessage = warningMessage; return this; }
            public WeatherConflictDtoBuilder suggestedAlternative(String suggestedAlternative) { this.suggestedAlternative = suggestedAlternative; return this; }
            public WeatherConflictDtoBuilder budgetImpact(Double budgetImpact) { this.budgetImpact = budgetImpact; return this; }

            public WeatherConflictDto build() {
                return new WeatherConflictDto(date, activityTitle, warningMessage, suggestedAlternative, budgetImpact);
            }
        }
    }
}
