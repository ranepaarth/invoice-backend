const data = {
  sellerDetails: {
    name: "ABC Pvt Ltd",
    address: "1234 Elm Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    pan: "ABCDE1234F",
    gst: "27ABCDE1234F1Z5",
  },
  placeOfSupply: "Maha",
  billingDetails: {
    customer_id: "1234567890",
    name: "XYZ Enterprises",
    address: "5678 Oak Street",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    stateCode: "27",
  },
  shippingDetails: {
    name: "XYZ Enterprises",
    address: "5678 Oak Street",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    stateCode: "27",
  },
  placeOfDelivery: "Maharashtra",
  orderDetails: {
    orderNo: "ORD12345",
    orderDate: "2024-06-25",
  },
  invoiceDetails: {
    invoiceNo: "INV12345",
    invoiceDate: "2024-06-26",
  },
  reverseCharge: false,
  itemDetails: [
    {
      item_id: "1001",
      description: "Product 1",
      rate: 100,
      quantity: 10,
      discount: 50,
      tax_percentage: 12.5,
      tax_id: "TAX001",
    },
    {
      item_id: "1002",
      description: "Product 2",
      rate: 200,
      quantity: 5,
      discount: 20,
      tax_percentage: 12.5,
      tax_id: "TAX002",
    },
  ],
  signatureImage: null,
  companyLogo: null,
};

module.exports = { data };
