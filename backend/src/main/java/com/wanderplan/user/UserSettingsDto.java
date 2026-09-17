package com.wanderplan.user;


public class UserSettingsDto {
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean sosAlertsEnabled;
    private String currency;
    private String emergencyContactName;
    private String emergencyContactPhone;

    public UserSettingsDto() {}

    public UserSettingsDto(boolean emailNotifications, boolean pushNotifications, boolean sosAlertsEnabled, String currency, String emergencyContactName, String emergencyContactPhone) {
        this.emailNotifications = emailNotifications;
        this.pushNotifications = pushNotifications;
        this.sosAlertsEnabled = sosAlertsEnabled;
        this.currency = currency;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isPushNotifications() {
        return pushNotifications;
    }

    public void setPushNotifications(boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
    }

    public boolean isSosAlertsEnabled() {
        return sosAlertsEnabled;
    }

    public void setSosAlertsEnabled(boolean sosAlertsEnabled) {
        this.sosAlertsEnabled = sosAlertsEnabled;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public static UserSettingsDtoBuilder builder() {
        return new UserSettingsDtoBuilder();
    }

    public static class UserSettingsDtoBuilder {
        private boolean emailNotifications;
        private boolean pushNotifications;
        private boolean sosAlertsEnabled;
        private String currency;
        private String emergencyContactName;
        private String emergencyContactPhone;

        public UserSettingsDtoBuilder() {}

        public UserSettingsDtoBuilder emailNotifications(boolean emailNotifications) {
            this.emailNotifications = emailNotifications;
            return this;
        }

        public UserSettingsDtoBuilder pushNotifications(boolean pushNotifications) {
            this.pushNotifications = pushNotifications;
            return this;
        }

        public UserSettingsDtoBuilder sosAlertsEnabled(boolean sosAlertsEnabled) {
            this.sosAlertsEnabled = sosAlertsEnabled;
            return this;
        }

        public UserSettingsDtoBuilder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public UserSettingsDtoBuilder emergencyContactName(String emergencyContactName) {
            this.emergencyContactName = emergencyContactName;
            return this;
        }

        public UserSettingsDtoBuilder emergencyContactPhone(String emergencyContactPhone) {
            this.emergencyContactPhone = emergencyContactPhone;
            return this;
        }

        public UserSettingsDto build() {
            return new UserSettingsDto(this.emailNotifications, this.pushNotifications, this.sosAlertsEnabled, this.currency, this.emergencyContactName, this.emergencyContactPhone);
        }
    }

}
