package com.wanderplan.invitation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class InvitationSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(InvitationSchemaMigration.class);
    private static final String TABLE_NAME = "trip_invitations";
    private static final String COLUMN_NAME = "invited_email";

    private final DataSource dataSource;

    public InvitationSchemaMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            String actualTableName = findTableName(metadata);
            if (actualTableName == null) {
                throw new IllegalStateException("Could not find the trip_invitations table for schema migration.");
            }

            if (isColumnNullable(metadata, actualTableName)) {
                return;
            }

            String databaseProduct = metadata.getDatabaseProductName().toLowerCase();
            String alterStatement;
            if (databaseProduct.contains("h2")) {
                alterStatement = "ALTER TABLE " + actualTableName
                        + " ALTER COLUMN " + COLUMN_NAME + " DROP NOT NULL";
            } else if (databaseProduct.contains("mysql") || databaseProduct.contains("mariadb")) {
                alterStatement = "ALTER TABLE " + actualTableName
                        + " MODIFY COLUMN " + COLUMN_NAME + " VARCHAR(255) NULL";
            } else {
                throw new IllegalStateException(
                        "Cannot make trip_invitations.invited_email nullable for unsupported database: "
                                + metadata.getDatabaseProductName());
            }

            try (Statement statement = connection.createStatement()) {
                statement.execute(alterStatement);
            }
            log.info("Updated {}.{} to allow shareable invitations without an email address.",
                    actualTableName, COLUMN_NAME);
        }
    }

    private String findTableName(DatabaseMetaData metadata) throws Exception {
        try (ResultSet tables = metadata.getTables(null, null, "%", new String[]{"TABLE"})) {
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                if (TABLE_NAME.equalsIgnoreCase(tableName)) {
                    return tableName;
                }
            }
        }
        return null;
    }

    private boolean isColumnNullable(DatabaseMetaData metadata, String tableName) throws Exception {
        try (ResultSet columns = metadata.getColumns(null, null, tableName, "%")) {
            while (columns.next()) {
                if (COLUMN_NAME.equalsIgnoreCase(columns.getString("COLUMN_NAME"))) {
                    return "YES".equalsIgnoreCase(columns.getString("IS_NULLABLE"));
                }
            }
        }
        throw new IllegalStateException("Could not find trip_invitations.invited_email for schema migration.");
    }
}
