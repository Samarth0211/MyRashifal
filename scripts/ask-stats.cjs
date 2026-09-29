require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  // Total signed-in users
  const totalUsers = await db.collection("users").countDocuments();
  console.log(`\n=== USER & ASK ASTROLOGER STATS ===\n`);
  console.log(`Total signed-in users: ${totalUsers}`);

  // Questions collection stats
  const totalQuestions = await db.collection("questions").countDocuments();
  console.log(`Total questions asked: ${totalQuestions}`);

  // Unique users who asked questions
  const uniqueAskers = await db.collection("questions").distinct("userId");
  console.log(`Users who used Ask Astrologer: ${uniqueAskers.length}`);

  // Breakdown per user
  const perUser = await db.collection("questions").aggregate([
    {
      $group: {
        _id: "$userId",
        count: { $sum: 1 },
        freeCount: { $sum: { $cond: ["$isFree", 1, 0] } },
        paidCount: { $sum: { $cond: ["$isFree", 0, 1] } },
      },
    },
    { $sort: { count: -1 } },
  ]).toArray();

  if (perUser.length > 0) {
    console.log(`\n--- Per-User Breakdown ---`);
    for (const u of perUser) {
      // Try to find user by ObjectId or string
      let user = null;
      try {
        user = await db.collection("users").findOne({ _id: new ObjectId(u._id) });
      } catch {
        user = await db.collection("users").findOne({ _id: u._id });
      }
      const name = user?.name || user?.email || u._id;
      console.log(`  ${name}: ${u.count} questions (${u.freeCount} free, ${u.paidCount} paid)`);
    }
  }

  // Recent questions
  const recent = await db.collection("questions").find().sort({ createdAt: -1 }).limit(10).toArray();
  if (recent.length > 0) {
    console.log(`\n--- Recent Questions ---`);
    for (const q of recent) {
      let user = null;
      try {
        user = await db.collection("users").findOne({ _id: new ObjectId(q.userId) });
      } catch {
        user = await db.collection("users").findOne({ _id: q.userId });
      }
      const name = user?.name || q.userId;
      const date = q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "unknown";
      console.log(`  [${date}] ${name}: "${q.question}"`);
    }
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
