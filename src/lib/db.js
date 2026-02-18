import clientPromise from './mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db('myrashifal');
}

// ── Kundli ──

export async function saveKundliToDB(userId, kundliData) {
  const db = await getDb();
  return db.collection('kundlis').updateOne(
    { userId },
    {
      $set: {
        userId,
        ...kundliData,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function getKundliFromDB(userId) {
  const db = await getDb();
  return db.collection('kundlis').findOne(
    { userId },
    { projection: { _id: 0, userId: 0 } }
  );
}

// ── Purchases ──

export async function savePurchaseToDB(userId, purchaseData) {
  const db = await getDb();
  return db.collection('purchases').insertOne({
    userId,
    reportType: purchaseData.reportType,
    paymentId: purchaseData.paymentId,
    razorpayOrderId: purchaseData.razorpayOrderId || null,
    amount: purchaseData.amount || null,
    currency: purchaseData.currency || 'INR',
    createdAt: new Date(),
  });
}

export async function getPurchasesFromDB(userId) {
  const db = await getDb();
  return db.collection('purchases')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function hasPurchase(userId, reportType) {
  const db = await getDb();
  const purchase = await db.collection('purchases').findOne({ userId, reportType });
  return !!purchase;
}

// ── Reports ──

export async function saveReportToDB(userId, reportType, reportData) {
  const db = await getDb();
  return db.collection('reports').updateOne(
    { userId, reportType },
    {
      $set: {
        userId,
        reportType,
        reportData,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function getReportFromDB(userId, reportType) {
  const db = await getDb();
  const doc = await db.collection('reports').findOne({ userId, reportType });
  return doc?.reportData || null;
}

export async function getAllReportsFromDB(userId) {
  const db = await getDb();
  return db.collection('reports')
    .find({ userId })
    .project({ _id: 0, userId: 0 })
    .toArray();
}
