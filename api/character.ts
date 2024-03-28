import mysql from 'mysql';
import express from 'express';
import { conn, queryAsync } from '../dbconn';
import { CharacterGetRes } from '../model/character_post_req';

export const router = express.Router();

router.get("/", (req, res) => {
    if (req.query.uid) {
        conn.query(mysql.format(`SELECT * FROM CHARACTRE WHERE uid = ?`, [req.query.uid]), (err, result) => {
            if (err) throw err;
            else res.json(result);
        });
    } else {
        conn.query(mysql.format(`SELECT * FROM CHARACTRE WHERE cid = ?`, [req.query.cid]), (err, result) => {
            if (err) throw err;
            else res.json(result[0]);
        });
    }
});

router.get("/GetCharacter", async (req, res) => {
  const AllCharacter = await queryAsync(`SELECT * FROM CHARACTRE`);
  res.json(AllCharacter);
});

router.get("/rank", async (req, res) => {
    const Yest =  await queryAsync(`SELECT c.cid, c.image, c.name, MAX(h.history_date) AS latest_date
                                    , MAX(h.history_point) AS latest_point
                                    , ROW_NUMBER() OVER (ORDER BY MAX(h.history_point) DESC) AS ranking 
                                    FROM CHARACTRE c INNER JOIN HISTORY h ON c.cid = h.cid 
                                    WHERE h.history_date < DATE_SUB(CURDATE(), INTERVAL 1 DAY) GROUP BY c.cid, c.image, c.name`);
                                    
    const Cur = await queryAsync(`SELECT c.cid, c.image, c.name, MAX(h.history_date) AS latest_date
                                , MAX(h.history_point) AS latest_point
                                , RANK() OVER (ORDER BY MAX(h.history_point) DESC) AS ranking 
                                FROM CHARACTRE c JOIN HISTORY h ON c.cid = h.cid GROUP BY c.cid`);
    res.json({
        Yest,
        Cur
    })
});

router.get("/graph", async (req, res) => {
    const graphData = await queryAsync(mysql.format(`SELECT
    (
      SELECT history_point
      FROM HISTORY
      WHERE cid = ?
        AND DATE(history_date) <= DATE_SUB(CURDATE(), INTERVAL day DAY)
      ORDER BY history_date DESC
      LIMIT 1
    ) AS history_point, 
    (
      SELECT DATE_FORMAT(history_date, '%Y-%m-%d')
      FROM HISTORY
      WHERE cid = ?
        AND DATE(history_date) <= DATE_SUB(CURDATE(), INTERVAL day DAY)
      ORDER BY history_date DESC
      LIMIT 1
    ) AS history_date
  FROM
    (
      SELECT 6 AS day
      UNION ALL
      SELECT 5
      UNION ALL
      SELECT 4
      UNION ALL
      SELECT 3
      UNION ALL
      SELECT 2
      UNION ALL
      SELECT 1
      UNION ALL
      SELECT 0
    ) AS dates`, [req.query.cid, req.query.cid]));
    res.json({
        graphData
    });
})

router.put("/", async (req, res) => {
    await queryAsync(mysql.format(`UPDATE CHARACTRE SET name = ? WHERE cid = ?`, [req.body.newname, req.body.cid]));
});

router.put("/deleteImgDB", async (req, res) => {
    await queryAsync(mysql.format(`DELETE FROM CHARACTRE WHERE cid = ?`, [req.body.cid]));
    await queryAsync(mysql.format(`UPDATE USER SET img_limit = img_limit - 1 WHERE uid = ?`, [req.body.uid]));
});
