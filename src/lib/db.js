import clientPromise from './mongodb';
import { nanoid } from 'nanoid';

async function getDb() {
  const client = await clientPromise;
  return client.db('myrashifal');
}

// ── Kundli ──

// Save a NEW kundli (multi-kundli: each user can have many)
export async function saveNewKundli(userId, kundliData, label = '') {
  const db = await getDb();
  const kundliId = nanoid(12);
  const isFirst = (await db.collection('kundlis').countDocuments({ userId })) === 0;
  await db.collection('kundlis').insertOne({
    userId,
    kundliId,
    label: label || kundliData.birthDetails?.name || '',
    isPrimary: isFirst,
    ...kundliData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return kundliId;
}

// Update an existing kundli by kundliId
export async function updateKundliInDB(userId, kundliId, kundliData) {
  const db = await getDb();
  return db.collection('kundlis').updateOne(
    { userId, kundliId },
    {
      $set: {
        ...kundliData,
        updatedAt: new Date(),
      },
    }
  );
}

// Legacy: save/update the user's primary kundli (backward compat for generate-kundli)
export async function saveKundliToDB(userId, kundliData) {
  const db = await getDb();
  const existing = await db.collection('kundlis').findOne({ userId, isPrimary: true });
  if (existing?.kundliId) {
    // Update existing primary
    await db.collection('kundlis').updateOne(
      { userId, kundliId: existing.kundliId },
      {
        $set: {
          ...kundliData,
          updatedAt: new Date(),
        },
      }
    );
    return existing.kundliId;
  }
  // No kundli yet — create new primary
  return saveNewKundli(userId, kundliData, kundliData.birthDetails?.name || '');
}

// Get primary kundli (backward compat)
export async function getKundliFromDB(userId) {
  const db = await getDb();
  const doc = await db.collection('kundlis').findOne(
    { userId, isPrimary: true },
    { projection: { _id: 0, userId: 0 } }
  );
  // Fallback: if no primary flag, get any kundli (pre-migration data)
  if (!doc) {
    return db.collection('kundlis').findOne(
      { userId },
      { projection: { _id: 0, userId: 0 } }
    );
  }
  return doc;
}

// Get ALL kundlis for a user
export async function getAllKundlisFromDB(userId) {
  const db = await getDb();
  return db.collection('kundlis')
    .find({ userId })
    .sort({ isPrimary: -1, createdAt: -1 })
    .project({ _id: 0, userId: 0 })
    .toArray();
}

// Get a specific kundli by ID
export async function getKundliByIdFromDB(userId, kundliId) {
  const db = await getDb();
  return db.collection('kundlis').findOne(
    { userId, kundliId },
    { projection: { _id: 0, userId: 0 } }
  );
}

// Delete a kundli and its reports
export async function deleteKundliFromDB(userId, kundliId) {
  const db = await getDb();
  await db.collection('reports').deleteMany({ userId, kundliId });
  return db.collection('kundlis').deleteOne({ userId, kundliId });
}

// Update kundli label
export async function updateKundliLabel(userId, kundliId, label) {
  const db = await getDb();
  return db.collection('kundlis').updateOne(
    { userId, kundliId },
    { $set: { label, updatedAt: new Date() } }
  );
}

// ── Purchases ──

export async function savePurchaseToDB(userId, purchaseData) {
  const db = await getDb();
  return db.collection('purchases').insertOne({
    userId,
    kundliId: purchaseData.kundliId || null,
    reportType: purchaseData.reportType,
    paymentId: purchaseData.paymentId,
    razorpayOrderId: purchaseData.razorpayOrderId || null,
    amount: purchaseData.amount || null,
    currency: purchaseData.currency || 'INR',
    isFree: purchaseData.isFree || false,
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

export async function hasPurchase(userId, reportType, kundliId) {
  const db = await getDb();
  const query = { userId, reportType };
  if (kundliId) query.kundliId = kundliId;
  const purchase = await db.collection('purchases').findOne(query);
  return !!purchase;
}

// Count PAID purchases of a specific report type (for loyalty)
export async function countPurchasesByReportType(userId, reportType) {
  const db = await getDb();
  return db.collection('purchases').countDocuments({
    userId,
    reportType,
    isFree: { $ne: true },
  });
}

// ── Reports ──

export async function saveReportToDB(userId, reportType, reportData, kundliId = null) {
  const db = await getDb();
  const query = { userId, reportType };
  if (kundliId) query.kundliId = kundliId;

  return db.collection('reports').updateOne(
    query,
    {
      $set: {
        userId,
        kundliId: kundliId || null,
        reportType,
        reportData,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function getReportFromDB(userId, reportType, kundliId = null) {
  const db = await getDb();
  const query = { userId, reportType };
  if (kundliId) query.kundliId = kundliId;
  const doc = await db.collection('reports').findOne(query);
  return doc?.reportData || null;
}

export async function getAllReportsFromDB(userId) {
  const db = await getDb();
  return db.collection('reports')
    .find({ userId })
    .project({ _id: 0, userId: 0 })
    .toArray();
}

// Get all reports for a specific kundli
export async function getReportsForKundli(userId, kundliId) {
  const db = await getDb();
  return db.collection('reports')
    .find({ userId, kundliId })
    .project({ _id: 0, userId: 0 })
    .toArray();
}

// ── Questions (Ask Astrologer) ──

export async function saveQuestionToDB(userId, { question, answer, isFree, paymentId }) {
  const db = await getDb();
  return db.collection('questions').insertOne({
    userId,
    question,
    answer,
    isFree,
    paymentId: paymentId || null,
    createdAt: new Date(),
  });
}

export async function countUserQuestions(userId) {
  const db = await getDb();
  return db.collection('questions').countDocuments({ userId });
}

export async function rateQuestion(questionId, userId, rating) {
  const { ObjectId } = await import('mongodb');
  const db = await getDb();
  return db.collection('questions').updateOne(
    { _id: new ObjectId(questionId), userId },
    { $set: { userRating: rating, ratedAt: new Date() } }
  );
}

export async function getUserQuestionHistory(userId, limit = 10) {
  const db = await getDb();
  return db.collection('questions')
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .project({ _id: 0, userId: 0 })
    .toArray();
}

// ── Newsletter Subscribers ──

export async function addSubscriber({ name, email, dob, rashi, lang }) {
  const db = await getDb();
  const { v4: uuidv4 } = await import('uuid');
  const unsubscribeToken = uuidv4();

  return db.collection('subscribers').updateOne(
    { email: email.toLowerCase() },
    {
      $set: {
        name,
        email: email.toLowerCase(),
        dob: dob || null,
        rashi: rashi || 'general',
        lang: lang || 'en',
        isActive: true,
        unsubscribeToken,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function getSubscriberByEmail(email) {
  const db = await getDb();
  return db.collection('subscribers').findOne({ email: email.toLowerCase() });
}

export async function updateSubscriberRashi(email, dob, rashi) {
  const db = await getDb();
  return db.collection('subscribers').updateOne(
    { email: email.toLowerCase() },
    { $set: { dob, rashi, updatedAt: new Date() } }
  );
}

export async function removeSubscriber(token) {
  const db = await getDb();
  return db.collection('subscribers').updateOne(
    { unsubscribeToken: token },
    { $set: { isActive: false, updatedAt: new Date() } }
  );
}

export async function getActiveSubscribers() {
  const db = await getDb();
  return db.collection('subscribers')
    .find({ isActive: true })
    .toArray();
}

export async function updateLastEmailSent(email) {
  const db = await getDb();
  return db.collection('subscribers').updateOne(
    { email },
    { $set: { lastEmailSent: new Date() } }
  );
}

// ── Push Subscriptions ──

export async function savePushSubscription({ endpoint, keys, rashi, lang, userId }) {
  const db = await getDb();
  return db.collection('push_subscriptions').updateOne(
    { endpoint },
    {
      $set: {
        endpoint,
        keys,
        rashi,
        lang: lang || 'en',
        userId,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function removePushSubscription(endpoint) {
  const db = await getDb();
  return db.collection('push_subscriptions').deleteOne({ endpoint });
}

export async function getActivePushSubscriptions() {
  const db = await getDb();
  return db.collection('push_subscriptions').find({}).toArray();
}

// ── Kundli Interpretation Cache ──

export async function getCachedInterpretation(cacheKey) {
  const db = await getDb();
  const doc = await db.collection('interpretation_cache').findOne({ cacheKey });
  return doc?.interpretation || null;
}

export async function saveCachedInterpretation(cacheKey, interpretation) {
  const db = await getDb();
  return db.collection('interpretation_cache').updateOne(
    { cacheKey },
    {
      $set: {
        cacheKey,
        interpretation,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

// ── Feedback ──

export async function saveFeedbackToDB(feedbackData) {
  const db = await getDb();
  return db.collection('feedback').insertOne({
    ...feedbackData,
    createdAt: new Date(),
  });
}

// ── App Notify (Download page) ──

export async function addNotifyEmail(email) {
  const db = await getDb();
  return db.collection('app_notify').updateOne(
    { email },
    {
      $set: { email, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

// ── Astrologer Profiles ──

export async function createAstrologerProfile(userId, data) {
  const db = await getDb();
  return db.collection('astrologers').insertOne({
    userId,
    ...data,
    phoneVerified: data.phoneVerified || false,
    status: 'pending',
    rating: { average: 0, count: 0 },
    totalSessions: 0,
    totalEarnings: 0,
    isOnline: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getAstrologerProfile(userId) {
  const db = await getDb();
  return db.collection('astrologers').findOne({ userId });
}

export async function getAstrologerById(astrologerId) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  return db.collection('astrologers').findOne({ _id: new ObjectId(astrologerId) });
}

export async function getApprovedAstrologers() {
  const db = await getDb();
  return db.collection('astrologers')
    .find({ status: 'approved' })
    .sort({ isOnline: -1, 'rating.average': -1 })
    .project({ userId: 0 })
    .toArray();
}

export async function updateAstrologerStatus(astrologerId, status) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  return db.collection('astrologers').updateOne(
    { _id: new ObjectId(astrologerId) },
    { $set: { status, updatedAt: new Date() } }
  );
}

export async function updateAstrologerProfile(userId, data) {
  const db = await getDb();
  return db.collection('astrologers').updateOne(
    { userId },
    { $set: { ...data, updatedAt: new Date() } }
  );
}

export async function setAstrologerOnline(userId, isOnline) {
  const db = await getDb();
  return db.collection('astrologers').updateOne(
    { userId },
    { $set: { isOnline, updatedAt: new Date() } }
  );
}

export async function getPendingAstrologers() {
  const db = await getDb();
  return db.collection('astrologers')
    .find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getAllAstrologers() {
  const db = await getDb();
  return db.collection('astrologers')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

// ── Chat Sessions ──

export async function createChatSession(data) {
  const db = await getDb();
  return db.collection('chat_sessions').insertOne({
    ...data,
    status: 'pending_payment',
    createdAt: new Date(),
  });
}

export async function getChatSession(sessionId) {
  const db = await getDb();
  return db.collection('chat_sessions').findOne({ sessionId });
}

export async function updateChatSession(sessionId, data) {
  const db = await getDb();
  return db.collection('chat_sessions').updateOne(
    { sessionId },
    { $set: { ...data, updatedAt: new Date() } }
  );
}

export async function getAstrologerSessions(astrologerId) {
  const db = await getDb();
  return db.collection('chat_sessions')
    .find({ astrologerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getUserChatSessions(userId) {
  const db = await getDb();
  return db.collection('chat_sessions')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

// ── Chat Messages ──

export async function addChatMessage(sessionId, sender, message) {
  const db = await getDb();
  return db.collection('chat_messages').insertOne({
    sessionId,
    sender,
    message,
    createdAt: new Date(),
  });
}

export async function getChatMessages(sessionId, after = null) {
  const db = await getDb();
  const query = { sessionId };
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  return db.collection('chat_messages')
    .find(query)
    .sort({ createdAt: 1 })
    .toArray();
}

// ── Astrologer Rating ──

export async function rateAstrologer(sessionId, astrologerId, rating) {
  const db = await getDb();
  const { ObjectId } = await import('mongodb');

  // Save rating on session
  await db.collection('chat_sessions').updateOne(
    { sessionId },
    { $set: { userRating: rating } }
  );

  // Recalculate average
  const sessions = await db.collection('chat_sessions')
    .find({ astrologerId, userRating: { $exists: true, $gt: 0 } })
    .toArray();
  const count = sessions.length;
  const average = count > 0
    ? Math.round((sessions.reduce((s, c) => s + c.userRating, 0) / count) * 10) / 10
    : 0;

  return db.collection('astrologers').updateOne(
    { _id: new ObjectId(astrologerId) },
    { $set: { 'rating.average': average, 'rating.count': count, updatedAt: new Date() } }
  );
}

// ── OTP Codes ──

export async function saveOtp(userId, email, otp) {
  const db = await getDb();
  return db.collection('otp_codes').updateOne(
    { userId },
    {
      $set: {
        userId,
        email,
        otp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    },
    { upsert: true }
  );
}

export async function verifyOtp(userId, otp) {
  const db = await getDb();
  const record = await db.collection('otp_codes').findOne({
    userId,
    otp,
    expiresAt: { $gt: new Date() },
  });
  if (record) {
    await db.collection('otp_codes').deleteOne({ _id: record._id });
    return true;
  }
  return false;
}

// ── Instagram Posts ──

export async function saveInstagramPost({ postType, contentKey, imageUrl, caption, mediaId, creationId }) {
  const db = await getDb();
  return db.collection('instagram_posts').insertOne({
    postType,
    contentKey,
    imageUrl,
    caption: caption.length > 200 ? caption.substring(0, 200) + '...' : caption,
    mediaId,
    creationId,
    postedAt: new Date(),
  });
}

export async function hasRecentPost(postType, contentKey) {
  const db = await getDb();
  const recent = await db.collection('instagram_posts').findOne({
    postType,
    contentKey,
    postedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  return !!recent;
}

export async function getLastPostOfType(postType) {
  const db = await getDb();
  return db.collection('instagram_posts').findOne(
    { postType },
    { sort: { postedAt: -1 } }
  );
}

// ── Cron State ──

export async function getCronState(key) {
  const db = await getDb();
  const doc = await db.collection('cron_state').findOne({ key });
  return doc?.value ?? null;
}

export async function setCronState(key, value) {
  const db = await getDb();
  return db.collection('cron_state').updateOne(
    { key },
    { $set: { key, value, updatedAt: new Date() } },
    { upsert: true }
  );
}
