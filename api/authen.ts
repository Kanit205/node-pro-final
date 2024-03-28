import mysql from 'mysql';
import express from 'express';
import { conn, queryAsync } from "../dbconn";
import { AuthenPostReq } from '../model/authen_post_req';
import { CharacterGetRes } from '../model/character_post_req';

export const router = express.Router();

router.get("/", (req, res) => {
    let sql, param;
    if (req.query.email) {
        sql = "select * from USER where email =?";
        param = req.query.email;
    } else {
        sql = "select * from USER where uid = ?";
        param = req.query.uid;
    }
    conn.query(sql, [param], (err, result) => {
        if (err) throw err;
        else res.json(result[0]);   
    });
});

router.post("/", (req, res) => {
    const user: AuthenPostReq = req.body;
    let sql =
        "insert into `USER` (`type`, `name`, `email`, `password`, `img_limit`) values (?, ?, ?, ?, ?)";
    sql = mysql.format(sql, [
        user.type,
        user.name,
        user.email,
        user.password,
        user.img_limit
    ]);

    conn.query(sql, (err, result) => {
        if (err) throw err;
        res
            .status(201)
            .json({
                affected_row: result.affectedRows,
                last_idx: result.insertId
            });
    });
});

router.put("/", async (req, res) => {
    await queryAsync(mysql.format(`UPDATE USER SET name = ? WHERE uid = ?`, [req.body.newname, req.body.uid]));     
});

router.put("/downlimit", async (req, res) => {
    await queryAsync(mysql.format(`UPDATE USER SET  img_limit = img_limit - 1 WHERE uid = ?`, [req.body.uid]));
});

router.get("/AllUser", async (req, res) => {
    const result = await queryAsync(`SELECT * FROM USER WHERE type != 1`);
    res.json(result);
});

router.put("/changePass", async (req, res) => {
    await queryAsync(mysql.format(`UPDATE USER SET password = ? WHERE uid = ?`, [req.body.newpass, req.body.uid]));
});