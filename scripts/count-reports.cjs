require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

(async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();

  const total = await db.collection("reports").countDocuments();
  console.log("Total reports:", total);

  const byType = await db.collection("reports").aggregate([
    { $group: { _id: "$reportType", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log("\nBy report type:");
  byType.forEach(r => console.log("  " + r._id + ": " + r.count));

  const byUser = await db.collection("reports").aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  console.log("\nBy user:");
  const userIds = byUser.map(u => u._id);
  const kundlis = await db.collection("kundlis").find(
    { userId: { $in: userIds } },
    { projection: { userId: 1, "birthDetails.name": 1, label: 1 } }
  ).toArray();

  const nameMap = {};
  kundlis.forEach(u => {
    if (!nameMap[u.userId]) {
      nameMap[u.userId] = u.label || (u.birthDetails && u.birthDetails.name) || u.userId;
    }
  });
  byUser.forEach(u => console.log("  " + (nameMap[u._id] || u._id) + ": " + u.count));

  client.close();
})();
