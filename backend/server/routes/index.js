import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { Submission, Admin } from "../models.js";
import { submissionSchema, loginSchema, passwordSchema, staffUpdateSchema } from "../validation.js";
import { requireAuth, signToken, publicAdmin, newReferenceNo } from "../middleware/auth.js";
import { ensureAdminAccount } from "../bootstrap.js";
import { asyncHandler, escapeRegex } from "../utils.js";
import { buildWorkbook } from "../exports/excel.js";
import { buildSubmissionPdf } from "../exports/pdf.js";
import {
  APP_TIME_ZONE,
  manilaMonth,
  parseManilaDate,
  startOfManilaDay,
  startOfManilaMonth,
} from "../time.js";

const router = express.Router();

const isValidId = (value) => mongoose.isValidObjectId(value);

const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many submissions from this device. Please try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Please wait a few minutes and try again." },
});

/* -------------------------------------------------------------------------- */
/* Public                                                                     */
/* -------------------------------------------------------------------------- */

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "kilos-profiling-api", timestamp: new Date().toISOString() });
});

router.post(
  "/submissions",
  submitLimiter,
  asyncHandler(async (req, res) => {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return res.status(422).json({
        message: first?.message || "Please review the information you entered.",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const payload = parsed.data;
    if (payload.website) {
      return res.status(400).json({ message: "Unable to submit this form." });
    }

    const { website, ...data } = payload;

    let submission;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        submission = await Submission.create({
          ...data,
          referenceNo: newReferenceNo(),
          status: "new",
          submittedAt: new Date(),
        });
        break;
      } catch (error) {
        lastError = error;
        if (error?.code !== 11000) break;
      }
    }

    if (!submission) {
      throw lastError || new Error("Could not save submission.");
    }

    return res.status(201).json({
      message: "Profile submitted successfully.",
      id: submission._id,
      referenceNo: submission.referenceNo,
      submittedAt: submission.submittedAt,
    });
  })
);

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

router.post(
  "/auth/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: parsed.error.issues[0].message });
    }

    const email = parsed.data.email.toLowerCase();
    await ensureAdminAccount();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const matches = await bcrypt.compare(parsed.data.password, admin.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    return res.json({
      message: "Signed in successfully.",
      token: signToken(admin),
      admin: publicAdmin(admin),
    });
  })
);

router.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ admin: publicAdmin(req.admin) });
  })
);

router.patch(
  "/auth/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: parsed.error.issues[0].message });
    }

    const admin = await Admin.findById(req.admin._id);
    const matches = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
    if (!matches) {
      return res.status(400).json({ message: "Your current password is incorrect." });
    }

    admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await admin.save();

    res.json({ message: "Password updated successfully." });
  })
);

/* -------------------------------------------------------------------------- */
/* Admin dashboard                                                            */
/* -------------------------------------------------------------------------- */

const STATUSES = ["new", "in_review", "referred", "completed"];

function buildSubmissionQuery(query) {
  const filter = {};
  const status = typeof query.status === "string" ? query.status : "";
  if (STATUSES.includes(status)) filter.status = status;

  const searchText = typeof query.search === "string" ? query.search.trim() : "";
  if (searchText) {
    const rx = new RegExp(escapeRegex(searchText), "i");
    filter.$or = [
      { referenceNo: rx },
      { "personal.cardHolderName": rx },
      { "personal.memberName": rx },
      { "personal.address": rx },
      { "personal.contactNo": rx },
      { "personal.householdId": rx },
    ];
  }

  const fromValue = typeof query.from === "string" ? query.from : "";
  const toValue = typeof query.to === "string" ? query.to : "";
  if (fromValue || toValue) {
    filter.submittedAt = {};
    if (fromValue) {
      const from = parseManilaDate(fromValue, false);
      if (from) filter.submittedAt.$gte = from;
    }
    if (toValue) {
      const to = parseManilaDate(toValue, true);
      if (to) filter.submittedAt.$lte = to;
    }
    if (Object.keys(filter.submittedAt).length === 0) delete filter.submittedAt;
  }

  return filter;
}

router.use("/admin", requireAuth);

router.get(
  "/admin/stats",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = startOfManilaDay(now);
    const startOfMonth = startOfManilaMonth(now);
    const sixMonthsAgo = manilaMonth(5, now).start;

    const [total, today, thisMonth, statusAgg, sectorsAgg, needsAgg, monthlyAgg, recent] =
      await Promise.all([
        Submission.countDocuments(),
        Submission.countDocuments({ submittedAt: { $gte: startOfToday } }),
        Submission.countDocuments({ submittedAt: { $gte: startOfMonth } }),
        Submission.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Submission.aggregate([
          { $unwind: { path: "$personal.sectors", preserveNullAndEmptyArrays: false } },
          { $group: { _id: "$personal.sectors", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
        Submission.aggregate([
          {
            $unwind: {
              path: "$opportunities.assistanceInterests",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $group: { _id: "$opportunities.assistanceInterests", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Submission.aggregate([
          { $match: { submittedAt: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: { date: "$submittedAt", timezone: APP_TIME_ZONE } },
                month: { $month: { date: "$submittedAt", timezone: APP_TIME_ZONE } },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Submission.find({})
          .sort({ submittedAt: -1 })
          .limit(6)
          .select(
            "referenceNo personal.cardHolderName personal.address status submittedAt opportunities.assistanceInterests"
          )
          .lean(),
      ]);

    const statusCounts = { new: 0, in_review: 0, referred: 0, completed: 0 };
    statusAgg.forEach((row) => {
      if (row._id in statusCounts) statusCounts[row._id] = row.count;
    });

    const monthly = [];
    for (let i = 5; i >= 0; i -= 1) {
      const month = manilaMonth(i, now);
      const match = monthlyAgg.find(
        (row) => row._id.year === month.year && row._id.month === month.month
      );
      monthly.push({
        key: month.key,
        label: month.label,
        count: match?.count || 0,
      });
    }

    res.json({
      total,
      today,
      thisMonth,
      statusCounts,
      sectors: sectorsAgg.map((row) => ({ label: row._id, count: row.count })),
      needs: needsAgg.map((row) => ({ label: row._id, count: row.count })),
      monthly,
      recent,
    });
  })
);

router.get(
  "/admin/submissions",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const filter = buildSubmissionQuery(req.query);

    const sort =
      req.query.sort === "name"
        ? { "personal.cardHolderName": 1 }
        : req.query.sort === "oldest"
          ? { submittedAt: 1 }
          : { submittedAt: -1 };

    const [items, total] = await Promise.all([
      Submission.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "referenceNo personal.cardHolderName personal.memberName personal.address personal.contactNo personal.sectors status submittedAt opportunities.assistanceInterests"
        )
        .lean(),
      Submission.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  })
);

router.get(
  "/admin/submissions/:id",
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Submission not found." });
    }
    const submission = await Submission.findById(req.params.id).lean();
    if (!submission) return res.status(404).json({ message: "Submission not found." });
    res.json({ submission });
  })
);

router.patch(
  "/admin/submissions/:id",
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Submission not found." });
    }
    const parsed = staffUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: parsed.error.issues[0].message });
    }

    const update = {};
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.staff) {
      Object.entries(parsed.data.staff).forEach(([key, value]) => {
        if (value !== undefined) update[`staff.${key}`] = value;
      });
    }

    const submission = await Submission.findByIdAndUpdate(req.params.id, { $set: update }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!submission) return res.status(404).json({ message: "Submission not found." });
    res.json({ message: "Record updated.", submission });
  })
);

router.delete(
  "/admin/submissions/:id",
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Submission not found." });
    }
    const deleted = await Submission.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Submission not found." });
    res.json({ message: "Submission deleted." });
  })
);

router.get(
  "/admin/export/excel",
  asyncHandler(async (req, res) => {
    let filter;
    if (req.query.ids) {
      const ids = String(req.query.ids)
        .split(",")
        .map((id) => id.trim())
        .filter(isValidId);
      if (ids.length === 0) {
        return res.status(400).json({ message: "No valid record IDs were provided." });
      }
      filter = { _id: { $in: ids } };
    } else {
      filter = buildSubmissionQuery(req.query);
    }

    const submissions = await Submission.find(filter).sort({ submittedAt: -1 }).lean();
    const workbook = await buildWorkbook(submissions);
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="KILOS-Responses-${date}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
  })
);

router.get(
  "/admin/submissions/:id/pdf",
  asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Submission not found." });
    }
    const submission = await Submission.findById(req.params.id).lean();
    if (!submission) return res.status(404).json({ message: "Submission not found." });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${submission.referenceNo || "KILOS"}.pdf"`
    );

    const doc = buildSubmissionPdf(submission);
    doc.pipe(res);
    doc.end();
  })
);

export default router;
