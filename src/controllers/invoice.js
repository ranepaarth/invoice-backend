import fs from "fs";
import moment from "moment";
import path from "path";
import PDFDocument from "pdfkit";
import { uploadPDF } from "../utils/cloudinary.js";

export const generateInvoice = async (req, res) => {
  const data = req.body;
  const signatureFile = req.file;
  const invoice = JSON.parse(data.invoice);
  const {
    sellerDetails,
    billingDetails,
    shippingDetails,
    orderDetails,
    lineItems,
    invoiceDetails,
    placeOfSupply,
    placeOfDelivery,
    reverseCharge,
  } = invoice;

  const taxType = placeOfSupply === placeOfDelivery ? "CGST_SGST" : "IGST";
  const tax_rate = 18;
  const calculatedItems = lineItems.map((item) => {
    const discountAmount =
      Number(item.unitPrice) * Number(item.quantity) -
      (Number(item.unitPrice) * Number(item.quantity) * Number(item.discount)) /
        100;
    const netAmount = discountAmount;
    const taxType = placeOfSupply === placeOfDelivery ? "CGST_SGST" : "IGST";
    const taxRate = tax_rate / 2;
    const taxAmount =
      taxType === "CGST_SGST"
        ? {
            CGST: (netAmount * taxRate) / 100,
            SGST: (netAmount * taxRate) / 100,
          }
        : { IGST: (netAmount * tax_rate) / 100 };
    const totalAmount =
      netAmount +
      (taxType === "CGST_SGST"
        ? taxAmount.CGST + taxAmount.SGST
        : taxAmount.IGST);
    return { ...item, netAmount, taxType, taxAmount, totalAmount };
  });

  const totalRow = calculatedItems.reduce(
    (acc, item) => ({
      netAmount: acc.netAmount + item.netAmount,
      taxAmount:
        acc.taxAmount +
        (item.taxType === "CGST_SGST"
          ? item.taxAmount.CGST + item.taxAmount.SGST
          : item.taxAmount.IGST),
      totalAmount: acc.totalAmount + item.totalAmount,
    }),
    { netAmount: 0, taxAmount: 0, totalAmount: 0 }
  );

  //TODO: Amount in words

  const doc = new PDFDocument();
  doc.fontSize(8);
  const filePath = path.join(
    process.cwd(),
    `/public/temp/Invoice_${invoiceDetails.invoiceNumber}.pdf`
  );

  doc.pipe(fs.createWriteStream(filePath));

  doc.image("images/logo.png", { fit: [100, 100], align: "left" });

  // Add seller, billing, and shipping details
  doc.text(
    `Seller Details: ${sellerDetails.sellerName}, ${sellerDetails.sellerAddress}, ${sellerDetails.sellerCity},${sellerDetails.sellerState},${sellerDetails.sellerPinCode}`,
    50,
    150
  );

  doc.text(`PAN No: ${sellerDetails.sellerPanNumber}`, 450, 150);
  doc.text(`GST No: ${sellerDetails.sellerGSTNumber}`, 450, 180);

  doc.text(`Place of Supply: ${placeOfSupply}`, 450, 250);
  doc.text(`Place of Delivery: ${placeOfDelivery}`, 450, 270);

  doc.text(
    `Billing Details: ${billingDetails.billingName}, ${billingDetails.billingAddress}`,
    50,
    200
  );
  doc.text(
    `Shipping Details: ${shippingDetails.shippingName}, ${shippingDetails.shippingAddress}`,
    50,
    250
  );

  // Add order and invoice details
  doc.text(`Order No: ${orderDetails.orderNumber}`, 50, 300);
  doc.text(`Order Date: ${orderDetails.orderDate}`, 50, 320);
  doc.text(`Invoice No: ${invoiceDetails.invoiceNumber}`, 50, 340);
  doc.text(`Invoice Date: ${moment(Date.now()).format("YYYY-MM-DD")}`, 50, 360);

  // Add table headers
  doc.text("Description", 50, 400);
  doc.text("Unit Price", 180, 400);
  doc.text("Quantity", 250, 400);
  doc.text("Discount", 300, 400);
  doc.text("Net Amount", 360, 400);
  doc.text("Tax Rate", 400, 400);
  doc.text("Tax Amount", 450, 400);
  doc.text("Total Amount", 550, 400);

  // Add item details
  let y = 420;
  calculatedItems.forEach((item) => {
    doc.text(item.description, 50, y);
    doc.text(Number(item.unitPrice).toFixed(2), 180, y);
    doc.text(item.quantity, 250, y);
    doc.text(Number(item.discount).toFixed(2), 300, y);
    doc.text(Number(item.netAmount).toFixed(2), 360, y);
    doc.text(item.taxRate, 400, y);
    doc.text(
      item.taxType === "CGST_SGST"
        ? item.taxAmount.CGST + item.taxAmount.SGST
        : item.taxAmount.IGST,
      450,
      y
    );
    doc.text(item.totalAmount.toFixed(2), 550, y);
    y += 20;
  });

  // Add total row
  doc.text("Total", 50, y);
  doc.text(Number(totalRow.netAmount).toFixed(2), 450, y);
  doc.text(Number(totalRow.taxAmount).toFixed(2), 650, y);
  doc.text(Number(totalRow.totalAmount).toFixed(2), 750, y);

  // TODO:Add amount in words
  // doc.text(`Amount in words: ${amountInWords}`, 50, y + 20);

  //TODO: Add signature
  // if (signatureFile) {
  //   doc.image(signatureFile, { fit: [150, 50], align: "center" });
  // }

  doc.text(`For ${sellerDetails.sellerName}`, 50, y + 100);
  doc.text("Authorised Signatory", 50, y + 120);

  doc.text(
    `Whether tax is payable under reverse charge - ${
      reverseCharge ? "Yes" : "No"
    }`,
    50,
    y + 150
  );
  doc.end();

  const pdf = await uploadPDF(filePath);
  console.log(pdf);

  res.status(200).json({
    pdf: pdf.secure_url,
  });
};
