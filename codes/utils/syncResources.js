const fs = require("fs");
const path = require("path");
const Resource = require("../models/resourceModel");

const RESOURCE_DIR = path.join(__dirname, "../public/resources");

async function scanFolder(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
            await scanFolder(fullPath);
        } else {
            const stats = fs.statSync(fullPath);

            const relativePath = path.relative(RESOURCE_DIR, fullPath);
            const parts = relativePath.split(path.sep);

            const branch = parts[0];
            const semester = Number(parts[1].replace("sem", ""));
            const subject = parts[2];
            const category = parts[3];

            const folderPath = parts.slice(4, -1).join("/");

            await Resource.updateOne(
                { filePath: relativePath },
                {
                    $set: {
                        title: path.parse(item.name).name,
                        branch,
                        semester,
                        subject,
                        category,
                        fileName: item.name,
                        filePath: relativePath,
                        fileType: path.extname(item.name),
                        fileSize: stats.size,
                        folderPath,
                    }
                },
                { upsert: true }
            );

            console.log("✅ Saved:", relativePath);
        }
    }
}

async function syncResources() {
    console.log("RESOURCE_DIR:", RESOURCE_DIR);
    if (!fs.existsSync(RESOURCE_DIR)) {
        console.log("❌ Resources folder not found.");
        return;
    }
    await scanFolder(RESOURCE_DIR);
    console.log("🎉 Resource Sync Completed");
}
module.exports = syncResources;