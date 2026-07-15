import db from "../config/db.js";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export const getSecrets = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const userId = req.user?.id || null;

  try {
    const result = await db.query(
      `
      SELECT
    secrets.id,
    secrets.secret,
    secrets.created_at,
    users.anonymous_name,

    COUNT(DISTINCT likes.id)::INTEGER AS like_count,

    CASE
        WHEN COUNT(
            CASE
                WHEN likes.user_id = $3 THEN 1
            END
        ) > 0
        THEN TRUE
        ELSE FALSE
    END AS liked_by_me

FROM secrets

JOIN users
ON users.id = secrets.user_id

LEFT JOIN likes
ON likes.secret_id = secrets.id

GROUP BY
    secrets.id,
    secrets.secret,
    secrets.created_at,
    users.anonymous_name

ORDER BY secrets.created_at DESC

LIMIT $1
OFFSET $2;
      `,
      [limit, offset, userId]
    );

    const secrets = result.rows;

    res.render("secrets.ejs", {
      secrets,
      page,
      formatTime: (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffSeconds = Math.floor((now - then) / 1000);

        if (diffSeconds < 5) return "just now";
        if (diffSeconds < 60) return `${diffSeconds} second${diffSeconds === 1 ? "" : "s"} ago`;
        if (diffSeconds < 3600) {
          const minutes = Math.floor(diffSeconds / 60);
          return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        }
        if (diffSeconds < 86400) {
          const hours = Math.floor(diffSeconds / 3600);
          return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }
        if (diffSeconds < 172800) return "Yesterday";

        const days = Math.floor(diffSeconds / 86400);
        if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

        return then.toLocaleDateString();
      }
    });
  } catch (err) {
    logger.error(err);
    res.render("secrets.ejs", {
      secrets: [],
      page,
      formatTime: (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffSeconds = Math.floor((now - then) / 1000);

        if (diffSeconds < 5) return "just now";
        if (diffSeconds < 60) return `${diffSeconds} second${diffSeconds === 1 ? "" : "s"} ago`;
        if (diffSeconds < 3600) {
          const minutes = Math.floor(diffSeconds / 60);
          return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        }
        if (diffSeconds < 86400) {
          const hours = Math.floor(diffSeconds / 3600);
          return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }
        if (diffSeconds < 172800) return "Yesterday";

        const days = Math.floor(diffSeconds / 86400);
        if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

        return then.toLocaleDateString();
      }
    });
  }
};

export const getSubmit = (req, res) => {
  res.render("submit.ejs");
};

export const postSubmit = async (req, res) => {
  const secret = req.body.secret;

  try {
    await db.query(
      "INSERT INTO secrets(user_id, secret) VALUES($1, $2)",
      [req.user.id, secret]
    );
    res.redirect("/secrets?whispered=1");
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to submit secret"
    });
  }
};

export const toggleLike = async (req, res) => {
  const secretId = Number(req.params.secretId);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  if (!Number.isInteger(secretId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid secret id"
    });
  }

  try {
    const secretCheck = await db.query("SELECT id FROM secrets WHERE id = $1", [secretId]);
    if (secretCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Secret not found"
      });
    }

    const existing = await db.query(
      "SELECT id FROM likes WHERE user_id = $1 AND secret_id = $2",
      [userId, secretId]
    );

    if (existing.rows.length > 0) {
      await db.query("DELETE FROM likes WHERE id = $1", [existing.rows[0].id]);
    } else {
      await db.query(
        "INSERT INTO likes (user_id, secret_id) VALUES ($1, $2)",
        [userId, secretId]
      );
    }

    const countResult = await db.query(
      "SELECT COUNT(*)::INTEGER AS like_count FROM likes WHERE secret_id = $1",
      [secretId]
    );

    const liked = existing.rows.length === 0;

    res.json({
      success: true,
      liked,
      likeCount: countResult.rows[0].like_count
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update like"
    });
  }
};

export const getLikeStatus = async (req, res) => {
  const secretId = Number(req.params.secretId);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  if (!Number.isInteger(secretId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid secret id"
    });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM likes WHERE user_id = $1 AND secret_id = $2",
      [userId, secretId]
    );

    const liked = existing.rows.length > 0;

    res.json({
      success: true,
      liked
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to check like"
    });
  }
};

export const getLikeStatusForSecret = async (req, res) => {
  const secretId = Number(req.params.secretId);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  if (!Number.isInteger(secretId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid secret id"
    });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM likes WHERE user_id = $1 AND secret_id = $2",
      [userId, secretId]
    );

    const liked = existing.rows.length > 0;

    res.json({
      success: true,
      liked
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to check like"
    });
  }
};

export const getLikeStatusForSecretWithFetch = async (req, res) => {
  const secretId = Number(req.params.secretId);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  if (!Number.isInteger(secretId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid secret id"
    });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM likes WHERE user_id = $1 AND secret_id = $2",
      [userId, secretId]
    );

    const liked = existing.rows.length > 0;

    res.json({
      success: true,
      liked
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to check like"
    });
  }
};