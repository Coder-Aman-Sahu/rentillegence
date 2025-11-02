const Listing = require("../models/listing");
const Booking = require("../models/booking");
const PDFDocument = require("pdfkit");

// --- HELPER FUNCTIONS ---

// Helper: Calculate all costs
function calculateCosts(price) {
  const advanceAmount = price; 
  const commissionAmount = parseFloat((advanceAmount * 0.025).toFixed(2));
  const totalAmount = advanceAmount + commissionAmount;
  return { advanceAmount, commissionAmount, totalAmount };
}

// Helper: Generate PDF Header
function generateHeader(doc) {
  doc
    .fillColor("#fe424d") // Brand color
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("RENTILLEGENCE", { align: "center" });
  doc
    .fillColor("#333")
    .fontSize(10)
    .font("Helvetica")
    .text("DIGITAL RENTAL AGREEMENT", { align: "center" });
  doc.moveDown(0.5);
  doc.strokeColor("#eee").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
}

// Helper: Generate PDF Section Header
function generateSectionHeader(doc, title) {
  doc.moveDown(1.5); // Tighter spacing
  doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text(title);
  doc.strokeColor("#ddd").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
}

// Helper: Generate Signature Box
function generateSignatureBox(doc, name, title, isSigned) {
  const boxY = doc.y;
  const boxX = doc.x;
  doc.strokeColor("#aaa").lineWidth(0.5)
     .rect(boxX, boxY, 240, 70).stroke(); // Smaller box
  
  if (isSigned) {
    doc.fillColor("#008000").font("Helvetica-Bold").fontSize(9) // Green, smaller
       .text("DIGITALLY SIGNED", boxX + 10, boxY + 10);
  } else {
    doc.fillColor("#999").font("Helvetica-Oblique").fontSize(9)
       .text("Awaiting Signature...", boxX + 10, boxY + 10);
  }

  doc.fillColor("#333").fontSize(10).font("Helvetica-Bold")
     .text(name, boxX + 10, boxY + 35);
  doc.fillColor("#666").fontSize(9).font("Helvetica")
     .text(title, boxX + 10, boxY + 50);
}

// --- CONTROLLER FUNCTIONS ---

// Renders the main dashboard
module.exports.renderDashboard = async (req, res) => {
  const userId = req.user._id;
  const rentals = await Booking.find({ renter: userId }).populate("listing owner");
  const receivedBookings = await Booking.find({ owner: userId }).populate(
    "listing renter"
  );
  res.render("users/dashboard.ejs", { rentals, receivedBookings });
};

// Flow 1: Renter requests to book
module.exports.requestBooking = async (req, res) => {
  const listingId = req.params.id;
  const listing = await Listing.findById(listingId).populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  if (listing.owner._id.equals(req.user._id)) {
     req.flash("error", "You cannot book your own listing.");
    return res.redirect(`/listings/${listingId}`);
  }

  const existingBooking = await Booking.findOne({
    listing: listingId,
    renter: req.user._id,
    status: { $in: ["pending_approval", "awaiting_signatures", "awaiting_payment"] }
  });

  if (existingBooking) {
    req.flash("error", "You already have a pending request for this listing.");
    return res.redirect("/dashboard");
  }

  const { advanceAmount, commissionAmount, totalAmount } = calculateCosts(
    listing.price
  );

  const newBooking = new Booking({
    listing: listingId,
    renter: req.user._id,
    owner: listing.owner._id,
    advanceAmount,
    commissionAmount,
    totalAmount,
    status: "pending_approval",
  });

  await newBooking.save();
  req.flash("success", "Rental request sent to the owner for approval!");
  res.redirect("/dashboard");
};

// Flow 2: Owner approves the request
module.exports.approveBooking = async (req, res) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId);

  if (!booking.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to approve this.");
    return res.redirect("/dashboard");
  }

  booking.status = "awaiting_signatures";
  await booking.save();
  req.flash("success", "Booking approved! Awaiting signatures from both parties.");
  res.redirect("/dashboard");
};

// Flow 2b: Owner rejects the request
module.exports.rejectBooking = async (req, res) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId);

  if (!booking.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to reject this.");
    return res.redirect("/dashboard");
  }
  
  if (booking.status !== 'pending_approval') {
    req.flash("error", "This booking is no longer pending approval.");
    return res.redirect("/dashboard");
  }

  booking.status = "rejected";
  await booking.save();
  req.flash("success", "Booking has been rejected.");
  res.redirect("/dashboard");
};

// Flow 3: Generate the PDF Agreement
// Flow 3: Generate the PDF Agreement
module.exports.generateAgreement = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate(
      "listing renter owner"
    );

    if (
      !booking.renter.equals(req.user._id) &&
      !booking.owner.equals(req.user._id)
    ) {
      req.flash("error", "You are not authorized to view this agreement.");
      return res.redirect("/dashboard");
    }

    const { listing, renter, owner, advanceAmount, commissionAmount } = booking;
    
    const doc = new PDFDocument({ 
      margin: 35,
      size: 'A4'
    });

    res.setHeader(
      "Content-disposition",
      `inline; filename="rental_agreement_${booking._id}.pdf"`
    );
    res.setHeader("Content-type", "application/pdf");
    
    doc.pipe(res);

    const pageWidth = doc.page.width - 70;
    const leftMargin = 35;

    // --- DECORATIVE HEADER ---
    doc.rect(leftMargin, 25, pageWidth, 65).fill("#1a1a2e");
    
    doc.fillColor("#ffffff")
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("RENTAL AGREEMENT", leftMargin, 40, { align: "center", width: pageWidth });
    
    doc.fontSize(8)
       .font("Helvetica")
       .fillColor("#e8e8e8")
       .text(`Agreement ID: ${booking._id.toString().substring(0, 16).toUpperCase()} | Executed: ${new Date(booking.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}`, 
         leftMargin, 68, { align: "center", width: pageWidth });

    doc.y = 105;

    // --- PARTIES SECTION (Two Columns) ---
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text("BETWEEN:", leftMargin);
    doc.moveDown(0.2);

    const col1X = leftMargin;
    const col2X = leftMargin + (pageWidth / 2) + 10;
    const startY = doc.y;

    // Left Column - Owner
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#444");
    doc.text("THE LESSOR (Owner)", col1X, startY);
    doc.moveDown(0.15);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text(owner.username, col1X);
    doc.fontSize(7.5).font("Helvetica").fillColor("#666");
    doc.text(owner.email, col1X);
    doc.moveDown(0.1);
    doc.fontSize(7).fillColor("#888").font("Helvetica-Oblique");
    doc.text("(Hereinafter 'Owner')", col1X);

    // Right Column - Renter
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#444");
    doc.text("THE LESSEE (Tenant)", col2X, startY);
    doc.moveDown(0.15);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text(renter.username, col2X);
    doc.fontSize(7.5).font("Helvetica").fillColor("#666");
    doc.text(renter.email, col2X);
    doc.moveDown(0.1);
    doc.fontSize(7).fillColor("#888").font("Helvetica-Oblique");
    doc.text("(Hereinafter 'Tenant')", col2X);

    doc.y = Math.max(doc.y, startY + 55);
    doc.moveDown(0.5);

    // --- PROPERTY & FINANCIAL DETAILS (Two Columns) ---
    doc.rect(leftMargin, doc.y, pageWidth, 1).fill("#e0e0e0");
    doc.moveDown(0.5);

    const sectionY = doc.y;

    // Left Column - Property
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text("PROPERTY DETAILS", col1X, sectionY);
    doc.moveDown(0.2);
    doc.fontSize(7.5).font("Helvetica").fillColor("#444");
    doc.text(`${listing.location}, ${listing.country}`, col1X, doc.y, { width: 240 });
    doc.fontSize(7).fillColor("#666");
    doc.text(listing.description.substring(0, 120) + (listing.description.length > 120 ? '...' : ''), col1X, doc.y + 2, { width: 240, align: 'justify' });

    // Right Column - Financial Summary
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text("FINANCIAL SUMMARY", col2X, sectionY);
    doc.moveDown(0.2);
    
    const finY = doc.y;
    doc.fontSize(7.5).font("Helvetica").fillColor("#444");
    doc.text("Monthly Rent:", col2X, finY);
    doc.text(`₹${listing.price.toLocaleString("en-IN")}`, col2X + 130, finY, { width: 100, align: 'right' });
    
    doc.text("Security Deposit:", col2X, finY + 12);
    doc.text(`₹${advanceAmount.toLocaleString("en-IN")}`, col2X + 130, finY + 12, { width: 100, align: 'right' });
    
    doc.text("Platform Fee (2.5%):", col2X, finY + 24);
    doc.text(`₹${commissionAmount.toLocaleString("en-IN")}`, col2X + 130, finY + 24, { width: 100, align: 'right' });
    
    doc.rect(col2X, finY + 37, 230, 0.5).fill("#bbb");
    
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text("TOTAL PAYABLE:", col2X, finY + 42);
    doc.fillColor("#d32f2f");
    doc.text(`₹${booking.totalAmount.toLocaleString("en-IN")}`, col2X + 130, finY + 42, { width: 100, align: 'right' });

    doc.y = Math.max(doc.y, sectionY + 90);
    doc.moveDown(0.5);

    // --- TERMS & CONDITIONS ---
    doc.rect(leftMargin, doc.y, pageWidth, 1).fill("#e0e0e0");
    doc.moveDown(0.4);

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#1a1a2e");
    doc.text("TERMS & CONDITIONS", leftMargin);
    doc.moveDown(0.2);

    const terms = [
      `Rent of ₹${listing.price.toLocaleString("en-IN")} payable by the 5th of each month. Late payment may incur penalties.`,
      `Security Deposit refundable within 30 days post-termination, less deductions for damages or dues.`,
      `Platform Fee of ₹${commissionAmount.toLocaleString("en-IN")} is non-refundable and covers service charges.`,
      `Tenant shall maintain property condition and not make structural changes without written consent.`,
      `Either party may terminate with 30 days' written notice. Early termination may forfeit deposit.`,
      `Utilities and maintenance responsibilities as per mutual agreement. Tenant liable for property damage.`
    ];

    doc.fontSize(7).font("Helvetica").fillColor("#444");
    terms.forEach((term, idx) => {
      const termY = doc.y;
      doc.text(`${idx + 1}.`, leftMargin + 5, termY, { width: 15 });
      doc.text(term, leftMargin + 20, termY, { width: pageWidth - 25, align: 'justify' });
      doc.moveDown(0.25);
    });

    doc.moveDown(0.3);

    // --- ACKNOWLEDGMENT ---
    doc.rect(leftMargin, doc.y, pageWidth, 1).fill("#e0e0e0");
    doc.moveDown(0.3);

    doc.fontSize(6.5).font("Helvetica-Oblique").fillColor("#666");
    doc.text(
      "Both parties confirm having read and understood all terms herein. Digital signatures via Rentillegence constitute legally binding consent to this agreement.",
      leftMargin, doc.y, { align: "justify", width: pageWidth }
    );
    doc.moveDown(0.5);

    // --- SIGNATURE BOXES ---
    const sigBoxWidth = (pageWidth / 2) - 10;
    const sigBoxHeight = 50;
    const sigY = doc.y;

    // Owner Signature Box
    doc.roundedRect(leftMargin, sigY, sigBoxWidth, sigBoxHeight, 3).stroke("#bbb");
    
    if (booking.ownerSigned) {
      doc.fillColor("#2e7d32").fontSize(7).font("Helvetica-Bold")
         .text("✓ SIGNED", leftMargin + 8, sigY + 6);
      doc.fillColor("#999").fontSize(6).font("Helvetica")
         .text(new Date().toLocaleDateString("en-IN"), leftMargin + 8, sigY + 16);
    } else {
      doc.fillColor("#999").fontSize(7).font("Helvetica-Oblique")
         .text("Pending Signature", leftMargin + 8, sigY + 6);
    }
    
    doc.fillColor("#1a1a2e").fontSize(9).font("Helvetica-Bold")
       .text(owner.username, leftMargin + 8, sigY + 28);
    doc.fillColor("#666").fontSize(6.5).font("Helvetica")
       .text("Owner / Lessor", leftMargin + 8, sigY + 40);

    // Tenant Signature Box
    const sig2X = leftMargin + sigBoxWidth + 20;
    doc.roundedRect(sig2X, sigY, sigBoxWidth, sigBoxHeight, 3).stroke("#bbb");
    
    if (booking.renterSigned) {
      doc.fillColor("#2e7d32").fontSize(7).font("Helvetica-Bold")
         .text("✓ SIGNED", sig2X + 8, sigY + 6);
      doc.fillColor("#999").fontSize(6).font("Helvetica")
         .text(new Date().toLocaleDateString("en-IN"), sig2X + 8, sigY + 16);
    } else {
      doc.fillColor("#999").fontSize(7).font("Helvetica-Oblique")
         .text("Pending Signature", sig2X + 8, sigY + 6);
    }
    
    doc.fillColor("#1a1a2e").fontSize(9).font("Helvetica-Bold")
       .text(renter.username, sig2X + 8, sigY + 28);
    doc.fillColor("#666").fontSize(6.5).font("Helvetica")
       .text("Tenant / Lessee", sig2X + 8, sigY + 40);

    // --- FOOTER ---
    const footerY = doc.page.height - 25;
    doc.fontSize(6).fillColor("#999").font("Helvetica");
    doc.text(
      "Rentillegence Digital Platform | This is a legally binding electronic agreement | For support, visit rentillegence.com",
      leftMargin,
      footerY,
      { align: "center", width: pageWidth }
    );

    doc.end();

  } catch (err) {
    console.error("PDF Generation Error:", err);
    if (!res.headersSent) {
      req.flash("error", "Could not generate agreement due to an error.");
      res.redirect("/dashboard");
    }
  }
};


// Flow 4: User "signs" the agreement
module.exports.signAgreement = async (req, res) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId);
  const isOwner = booking.owner.equals(req.user._id);
  const isRenter = booking.renter.equals(req.user._id);

  if (!isOwner && !isRenter) {
    req.flash("error", "You are not authorized to sign this.");
    return res.redirect("/dashboard");
  }

  if (isRenter) booking.renterSigned = true;
  if (isOwner) booking.ownerSigned = true;

  if (booking.renterSigned && booking.ownerSigned) {
    booking.status = "awaiting_payment";
  }

  await booking.save();
  req.flash("success", "Agreement successfully signed!");
  res.redirect("/dashboard");
};

// Flow 5: Show the payment simulation page
module.exports.renderPaymentPage = async (req, res) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId).populate("listing");

  if (!booking.renter.equals(req.user._id)) {
    req.flash("error", "You are not authorized to make this payment.");
    return res.redirect("/dashboard");
  }
  
  if (booking.status !== "awaiting_payment") {
    req.flash("error", "This booking is not awaiting payment.");
    return res.redirect("/dashboard");
  }

  res.render("users/payment_simulation.ejs", { booking });
};

// Flow 6: Simulate the payment
module.exports.simulatePayment = async (req, res) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId);

  if (!booking.renter.equals(req.user._id)) {
    req.flash("error", "You are not authorized to make this payment.");
    return res.redirect("/dashboard");
  }

  booking.paymentSimulated = true;
  booking.status = "confirmed";
  await booking.save();

  req.flash("success", "Payment successful! Your booking is confirmed.");
  res.redirect("/dashboard");
};

