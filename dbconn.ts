import mysql from "mysql";
import util from "util";

export const conn = mysql.createPool(
    {
        connectionLimit: 10,
        host: "202.28.34.197",
        user: "web66_65011212047",
        password: "65011212047@csmsu",
        database: "web66_65011212047"
    }
);

export const queryAsync = util.promisify(conn.query).bind(conn);

