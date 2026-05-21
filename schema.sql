-- ============================================================
--  SportLink Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS sportlink
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sportlink;


-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    user_id        BIGINT          NOT NULL AUTO_INCREMENT,
    full_name      VARCHAR(100)    NOT NULL,
    email          VARCHAR(150)    NOT NULL,
    google_id      VARCHAR(100)    NULL,
    auth_provider  ENUM('local','google') NOT NULL DEFAULT 'local',
    password       VARCHAR(255)    NULL COMMENT 'NULL nếu đăng nhập Google',
    avatar_url     VARCHAR(255)    NULL,
    age            INT             NULL,
    location_lat   DECIMAL(10,8)   NULL,
    location_lng   DECIMAL(11,8)   NULL,
    role           ENUM('user','admin') NOT NULL DEFAULT 'user',
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    trust_score    DECIMAL(2,1)    NOT NULL DEFAULT 5.0,
    ban_until      DATETIME        NULL COMMENT 'NULL = không bị khoá',
    total_rating   INT             NOT NULL DEFAULT 0,
    created_at     DATETIME        NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_email (email),
    UNIQUE KEY uq_google_id (google_id)
) ENGINE=InnoDB;

-- ============================================================
-- 2. USER_SPORTS
-- ============================================================
CREATE TABLE user_sports (
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    user_id     BIGINT  NOT NULL,
    sport_type  ENUM(
                    'bong_da',
                    'cau_long',
                    'pickleball'
                ) NOT NULL,
    skill_level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',

    PRIMARY KEY (id),
    CONSTRAINT fk_usersports_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. SPORT_POSTS
-- ============================================================
CREATE TABLE sport_posts (
    post_id        BIGINT          NOT NULL AUTO_INCREMENT,
    user_id        BIGINT          NOT NULL,
    team_name      VARCHAR(100)    NOT NULL,
    sport_type     ENUM(
                       'bong_da',
                       'cau_long',
                       'pickleball'
                   ) NOT NULL,
    post_type      ENUM('find_team','find_rival') NOT NULL,
    play_time      DATETIME        NOT NULL,
    skill_level    ENUM('beginner','intermediate','advanced') NULL,
    location_name  VARCHAR(255)    NOT NULL,
    location_lat   DECIMAL(10,8)   NOT NULL,
    location_lng   DECIMAL(11,8)   NOT NULL,
    slots_total    INT             NOT NULL,
    slots_filled   INT             NOT NULL DEFAULT 0,
    play_format    ENUM('don_nam',
                        'don_nu',
                        'doi_nam',
                        'doi_nu')  NULL COMMENT 'NULL cho bong_da, co gia tri cho cau_long va pickleball',
    note           TEXT            NULL,
    status         ENUM('open','full','expired','matched') NOT NULL DEFAULT 'open',
    created_at     DATETIME        NOT NULL DEFAULT NOW(),

    PRIMARY KEY (post_id),
    CONSTRAINT fk_sportposts_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. JOIN_REQUESTS
-- ============================================================
CREATE TABLE join_requests (
    request_id    BIGINT  NOT NULL AUTO_INCREMENT,
    post_id       BIGINT  NOT NULL,
    requester_id  BIGINT  NOT NULL,
    request_type  ENUM('join','challenge') NOT NULL,
    status        ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
    message       TEXT    NULL COMMENT '"Tôi muốn tham gia" / "Tôi muốn giao hữu"',
    created_at    DATETIME NOT NULL DEFAULT NOW(),
    responded_at  DATETIME NULL,

    PRIMARY KEY (request_id),
    CONSTRAINT fk_joinreq_post
        FOREIGN KEY (post_id) REFERENCES sport_posts (post_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_joinreq_user
        FOREIGN KEY (requester_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. CHAT_GROUPS
-- ============================================================
CREATE TABLE chat_groups (
    group_id    BIGINT          NOT NULL AUTO_INCREMENT,
    post_id     BIGINT          NOT NULL,
    group_name  VARCHAR(150)    NOT NULL,
    group_type  ENUM('team','rival') NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT NOW(),

    PRIMARY KEY (group_id),
    CONSTRAINT fk_chatgroups_post
        FOREIGN KEY (post_id) REFERENCES sport_posts (post_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. GROUP_MEMBERS
-- ============================================================
CREATE TABLE group_members (
    group_member_id  BIGINT  NOT NULL AUTO_INCREMENT,
    group_id         BIGINT  NOT NULL,
    user_id          BIGINT  NOT NULL,
    role             ENUM('admin','member') NOT NULL DEFAULT 'member',
    joined_at        DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (group_member_id),
    CONSTRAINT fk_groupmembers_group
        FOREIGN KEY (group_id) REFERENCES chat_groups (group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_groupmembers_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. MESSAGES
-- ============================================================
CREATE TABLE messages (
    message_id  BIGINT   NOT NULL AUTO_INCREMENT,
    group_id    BIGINT   NOT NULL,
    sender_id   BIGINT   NOT NULL,
    content     TEXT     NULL,
    msg_type    ENUM('text','image') NOT NULL DEFAULT 'text',
    image_url   VARCHAR(255) NULL,
    sent_at     DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (message_id),
    CONSTRAINT fk_messages_group
        FOREIGN KEY (group_id) REFERENCES chat_groups (group_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    notif_id    BIGINT   NOT NULL AUTO_INCREMENT,
    user_id     BIGINT   NOT NULL,
    type        ENUM(
                    'join_request',
                    'accepted',
                    'rejected',
                    'group_full',
                    'challenged',
                    'banned'
                ) NOT NULL,
    ref_id      BIGINT   NULL COMMENT 'request_id hoặc post_id tuỳ type',
    content     TEXT     NOT NULL,
    is_read     BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (notif_id),
    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. RATINGS
-- ============================================================
CREATE TABLE ratings (
    rating_id   BIGINT    NOT NULL AUTO_INCREMENT,
    request_id  BIGINT    NOT NULL,
    rater_id    BIGINT    NOT NULL COMMENT 'Người đánh giá',
    rated_id    BIGINT    NOT NULL COMMENT 'Người bị đánh giá',
    stars       TINYINT   NOT NULL COMMENT '1 đến 5 sao',
    is_revealed BOOLEAN   NOT NULL DEFAULT FALSE COMMENT 'Blind review: chỉ tính vào trustScore khi TRUE',
    created_at  DATETIME  NOT NULL DEFAULT NOW(),

    PRIMARY KEY (rating_id),
    CONSTRAINT fk_ratings_request
        FOREIGN KEY (request_id) REFERENCES join_requests (request_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ratings_rater
        FOREIGN KEY (rater_id) REFERENCES users (user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ratings_rated
        FOREIGN KEY (rated_id) REFERENCES users (user_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_stars CHECK (stars BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ============================================================
-- 9b. RATING_TAGS (bảng phụ cho multi-select nhãn đánh giá)
-- ============================================================
CREATE TABLE rating_tags (
    rating_id  BIGINT       NOT NULL,
    tag        ENUM(
                   'khong_uy_tin',
                   'thai_do_khong_dep',
                   'khong_dung_hen',
                   'uy_tin',
                   'thai_do_tot'
               ) NOT NULL,

    CONSTRAINT fk_ratingtags_rating
        FOREIGN KEY (rating_id) REFERENCES ratings (rating_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. INVALIDATED_TOKENS
-- ============================================================
CREATE TABLE invalidated_tokens (
    id          VARCHAR(255) NOT NULL,
    expiry_time DATETIME     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES (tăng tốc truy vấn)
-- ============================================================
CREATE INDEX idx_sportposts_sport_type  ON sport_posts  (sport_type);
CREATE INDEX idx_sportposts_status      ON sport_posts  (status);
CREATE INDEX idx_sportposts_play_time   ON sport_posts  (play_time);
CREATE INDEX idx_joinreq_post           ON join_requests (post_id);
CREATE INDEX idx_joinreq_status         ON join_requests (status);
CREATE INDEX idx_messages_group         ON messages     (group_id);
CREATE INDEX idx_notif_user_read        ON notifications (user_id, is_read);
CREATE INDEX idx_ratings_rated          ON ratings      (rated_id);
