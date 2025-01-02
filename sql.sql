


template_schema
留有 membership_tier_id 1-4

CREATE TABLE IF NOT EXISTS mm9_client.admin_setting
(
    admin_setting_id integer NOT NULL DEFAULT nextval('membi_template_schema.admin_setting_admin_setting_id_seq'::regclass),
    membership_extend_method integer NOT NULL,
    membership_end_result integer NOT NULL,
    membership_period integer NOT NULL DEFAULT 12,
    wati_end_point text COLLATE pg_catalog."default",
    wati_access_token text COLLATE pg_catalog."default",
    CONSTRAINT admin_setting_pkey PRIMARY KEY (admin_setting_id)
)

TABLESPACE pg_default;

admin_setting_id=1
membership_extend_method=1
membership_end_result=1
membership_period=1



CREATE TABLE IF NOT EXISTS membi.membership_tier
(
    membership_tier_id integer NOT NULL DEFAULT nextval('membi.member_tier_member_tier_id_seq'::regclass),
    membership_tier_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    membership_tier_sequence integer NOT NULL,
    require_point integer NOT NULL,
    extend_membership_point integer NOT NULL,
    point_multiplier numeric(10,2) NOT NULL,
    membership_period integer NOT NULL,
    original_point integer,
    multiplied_point integer,
    CONSTRAINT membership_tier_pkey PRIMARY KEY (membership_tier_id),
    CONSTRAINT membership_tier_membership_tier_sequence_key UNIQUE (membership_tier_sequence)
)

TABLESPACE pg_default;



[
    {
        "membership_tier_id": 1,
        "membership_tier_name": "初階會員",
        "membership_tier_sequence": 1,
        "require_point": 0,
        "extend_membership_point": 0,
        "point_multiplier": 1000,
        "membership_period": 1,
        "original_point": 1,
        "multiplied_point": 1
    },
    {
        "membership_tier_id": 2,
        "membership_tier_name": "Level 2",
        "membership_tier_sequence": 2,
        "require_point": 1,
        "extend_membership_point": 1,
        "point_multiplier": 1000,
        "membership_period": 2,
        "original_point": 100,
        "multiplied_point": 100
    },
    {
        "membership_tier_id": 3,
        "membership_tier_name": "Level 3",
        "membership_tier_sequence": 3,
        "require_point": 3,
        "extend_membership_point": 3,
        "point_multiplier": 1000,
        "membership_period": 3,
        "original_point": 110,
        "multiplied_point": 110
    },
    {
        "membership_tier_id": 4,
        "membership_tier_name": "Level 4",
        "membership_tier_sequence": 4,
        "require_point": 4,
        "extend_membership_point": 4,
        "point_multiplier": 1000,
        "membership_period": 4,
        "original_point": 120,
        "multiplied_point": 120
    }
]



更新 membership 頁面資料後，會員不會自動按新設定更新



與 shopify 互動 - 先建立 app 內資料，再有 button click to 同步 shopify 


