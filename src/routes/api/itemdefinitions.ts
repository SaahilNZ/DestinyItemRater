import express from "express";
import path from "path";

const router = express.Router();
router.get('/', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, './data/ItemDefinitions.json'));
});

export default router;