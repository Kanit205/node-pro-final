import { queryAsync } from './../dbconn';
import mysql from 'mysql';
import { conn } from "../dbconn";
import express from "express";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject} from "firebase/storage";

export const router = express.Router();

const firebaseConfig = {
    apiKey: "AIzaSyAbtTVwJZfgSzrj5vkYV-mkxJ2bWSTpH0o",
    authDomain: "anihot-72a0a.firebaseapp.com",
    projectId: "anihot-72a0a",
    storageBucket: "anihot-72a0a.appspot.com",
    messagingSenderId: "1035115883061",
    appId: "1:1035115883061:web:615f0bd0dc8f1d89429f7c",
    measurementId: "G-VXRZW76JSN"
};

initializeApp(firebaseConfig);

const storage = getStorage();

class FileMiddleware {
    filename = "";
    public readonly diskLoader = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 67108864,
        },
    });
}

const fileUpload = new FileMiddleware();

router.post("/GetUrl", fileUpload.diskLoader.single("img"), async(req, res) => {
    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "ImgCharacter/" + filename);
    const metadata = {
        contentType: req.file!.mimetype
    }
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    // res.status(200).json({ filename: downloadUrl });
    queryAsync(mysql.format("insert into `CHARACTRE` (`uid`, `image`, `name`, `total_point`, `date`) value (?, ?, ?, ?, NOW())", [req.body.uid, downloadUrl, req.body.name, 1000]));
    queryAsync(mysql.format(`UPDATE USER SET img_limit = img_limit + 1 WHERE uid = ?`, [req.body.uid]));
});

router.put("/ImgProfile", fileUpload.diskLoader.single("img"), async(req, res) => {
    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "ImgProfile/" + filename);
    const metadata = {
        contentType: req.file!.mimetype
    }
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    // res.status(200).json({ filename: downloadUrl });

    conn.query(mysql.format(`UPDATE USER SET image = ? WHERE uid = ?`, [downloadUrl, req.body.uid]), (err, result) => {
        if (err) throw err;
        res.status(200).json({
            affected_row: result.affectedRows,
        });
    });
});


router.put("/updateCharacterImg", fileUpload.diskLoader.single("img"), async (req, res) => {
    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "ImgCharacter/" + filename);
    const metadata = {
        contentType: req.file!.mimetype
    }
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    await queryAsync(mysql.format(`UPDATE CHARACTRE SET image = ?, total_point = ?, date = NOW() WHERE cid = ?`, [downloadUrl, 1000, req.body.cid]));
});

router.put("/", (req, res) => {
    // Construct the reference to the file using its path relative to the root of the bucket
    // const filename = extractFilenameFromUrl(req.body.url);
    const imgRef = ref(storage, req.body.url);
    
    // Use deleteObject to delete the file
    deleteObject(imgRef)
        .then(() => {
            // If deletion is successful, send a success response
            res.status(200).json("Finish");
        })
        .catch((error) => {
            // If an error occurs during deletion, send an error response
            res.status(500).json(error);
        });
});


// function extractFilenameFromUrl(url: string): string {
//     // Split the URL by '/' and get the last part (filename)
//     const parts = url.split('/');
//     let filename = parts[parts.length - 1];
//     filename = filename.split('?')[0];
//     console.log(filename);
    

//     // Decode the filename (in case it contains encoded characters)
//     return decodeURIComponent(filename);
// }


