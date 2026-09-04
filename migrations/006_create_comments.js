export const up = (pgm) => {
    pgm.createTable("comments", {
        id: "id",

        user_id: {
            type: "integer",
            notNull: true,
            references: "users",
            onDelete: "CASCADE"
        },

        secret_id: {
            type: "integer",
            notNull: true,
            references: "secrets",
            onDelete: "CASCADE"
        },

        comment: {
            type: "text",
            notNull: true
        },

        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        }
    });

    // Faster lookup of comments belonging to a particular secret
    pgm.createIndex("comments", ["secret_id"]);

    // Faster lookup of comments made by a particular user
    pgm.createIndex("comments", ["user_id"]);
};

export const down = (pgm) => {
    pgm.dropTable("comments");
};