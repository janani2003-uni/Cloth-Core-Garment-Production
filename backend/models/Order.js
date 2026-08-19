const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // The order's single operational lifecycle — Admin/Supervisor move it
    // forward manually (Approve, Send to Production, dispatch a Delivery).
    // Payment is tracked entirely separately via `paymentStatus` below; it
    // never gates or drives this field automatically.
    //   Pending -> Approved -> Production -> "In Delivery" (set
    //   automatically when a Delivery record is dispatched, see
    //   deliveryRoutes.js) -> Delivered
    //   Cancelled is a separate exception branch, reachable from any state.
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Production",
        "In Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    deliveryDate: {
      type: Date,
      required: false,
    },

    // Captured at placement time on the Order Delivery step. Previously
    // collected in the UI but never sent to the backend at all ("for
    // reference only" per the old disclaimer) — Admin/Supervisor had no way
    // to know what the shop owner actually asked for once it came time to
    // schedule the real delivery. Copied onto the Delivery record when one
    // is created (see deliveryRoutes.js), editable there from that point on.
    deliveryAddress: {
      type: String,
      trim: true,
      default: "",
    },

    // Only Factory Delivery exists as a real, selectable option now — Home
    // Delivery / Pickup Point / Courier Service have been removed system-
    // wide. The empty string is kept only so pre-existing orders without a
    // method set don't fail validation.
    deliveryMethod: {
      type: String,
      enum: ["Factory Delivery", ""],
      default: "Factory Delivery",
    },

    // Coarse, three-value payment summary — the one field every page reads
    // for an at-a-glance payment state. Set by paymentRoutes.js when Admin
    // verifies a submitted payment: Pending (nothing verified yet) ->
    // "Advance Paid" (a partial/advance payment verified) -> "Full Paid"
    // (a Full Payment verified). Independent of `status` above — this never
    // gates or drives the operational lifecycle automatically.
    paymentStatus: {
      type: String,
      enum: ["Pending", "Advance Paid", "Full Paid"],
      default: "Pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Two required 50/50 installments, always computed and validated on the
    // backend — never trusted from a frontend-submitted amount (see
    // orderRoutes.js/paymentRoutes.js). advanceAmount + remainingBalance
    // always equals totalAmount at the moment the order is created; amountPaid
    // is the live running total of every Verified payment against this order
    // (kept in sync by paymentRoutes.js's verify route), and remainingBalance
    // is recomputed from it the same way.
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Reference to the Step 2 design (AI-generated or an uploaded logo).
    // Deliberately lightweight — file paths/prompts only, never raw file
    // bytes, since this collection is read broadly (dashboards, reports)
    // and shouldn't carry multi-MB documents.
    design: {
      // Legacy fields, kept for any pre-existing orders.
      type: {
        type: String,
        enum: ["upload", "ai", null],
        default: null,
      },
      url: { type: String, trim: true, default: "" },
      fileName: { type: String, trim: true, default: "" },
      prompt: { type: String, trim: true, default: "" },

      // Which of the two Step 2 methods the shop owner actually used —
      // persisted so Step 4 Review, the Order Confirmation receipt, and the
      // Admin/Supervisor approval view can all show "Design Type: Uploaded
      // Logo" or "Design Type: AI Generated" from real saved data, not
      // React state.
      designSource: {
        type: String,
        enum: ["uploaded_logo", "ai_generated", null],
        default: null,
      },

      // Real disk-backed path for an uploaded logo (own upload, or the
      // shop's saved Shop Logo reused for this order) — e.g.
      // "/uploads/designs/xxx.png". Never a base64 string.
      uploadedLogoPath: { type: String, trim: true, default: "" },

      // Whether the uploaded logo came from the shop's saved Shop Logo
      // ("shop_logo") or a fresh upload just for this order ("order_upload").
      uploadedLogoSource: {
        type: String,
        enum: ["shop_logo", "order_upload", ""],
        default: "",
      },

      // AI-generated result — kept as the data: URI the generator returns
      // (small, since it's a single preview image, not a broadly-reused
      // asset), so the exact image the shop owner approved is always
      // reproducible later without depending on the AI provider again.
      generatedDesignPath: { type: String, default: "" },

      // What was actually selected in Step 1 at the time this design was
      // chosen — lets the garment-preview compositing reproduce the exact
      // same preview (garment/fabric/color) on Step 4 Review, the Admin
      // approval view, and the PDF receipt, even if the shop owner later
      // navigates back and changes their Step 1 selection.
      previewGarment: { type: String, trim: true, default: "" },
      previewColor: { type: String, trim: true, default: "" },
      previewColorHex: { type: String, trim: true, default: "" },
    },

    // Clean garment name ("Denim" / "Shirt" / "T-Shirt" / "Hoodie") used to
    // look up size-level stock — `item` is a composed display string
    // ("Denim (Cotton Blend, Navy)") and isn't reliable for that lookup.
    garmentType: {
      type: String,
      trim: true,
      default: "",
    },

    // Per-size quantities from Step 3 (e.g. { S: 20, M: 40, ... }). Not
    // captured before the approval feature existed, so old orders simply
    // have an empty map — approval-details treats that as "no breakdown
    // available" rather than crashing.
    sizeBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },

    // Pre-payment Admin/Supervisor approval gate, entirely separate from
    // `status` above. `status` continues to track the operational/
    // production lifecycle (Pending -> Approved -> Production -> Delivered)
    // exactly as it always has, driven from AdminOrders.js. This object
    // tracks the *new*, distinct gate that blocks a shop owner from reaching
    // Payment until stock has been verified and an Admin/Supervisor signs
    // off — reusing the `status` enum for both would conflate "we've
    // reviewed and accepted this order" with "production has started",
    // which are different moments and already have different UI/logic
    // built around `status`.
    //
    // Orders created before this feature default to "Not Required" (see
    // the schema `default` below) so they never block anything — Mongoose
    // applies that default when an old document is read even though the
    // field was never written, so no migration script is needed for
    // existing data.
    approval: {
      status: {
        type: String,
        enum: ["Not Required", "Pending", "Approved", "Rejected"],
        default: "Not Required",
      },
      notes: { type: String, trim: true, default: "" },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      approvedByRole: { type: String, default: "" },
      approvedAt: { type: Date, default: null },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      rejectedAt: { type: Date, default: null },
      rejectionReason: { type: String, trim: true, default: "" },
      stockVerifiedAt: { type: Date, default: null },
      stockVerificationResult: {
        status: { type: String, enum: ["", "sufficient", "insufficient"], default: "" },
        details: [
          {
            _id: false,
            size: String,
            requested: Number,
            available: Number,
            sufficient: Boolean,
          },
        ],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);