/**
 * GST Service (Mock implementation for now)
 * This acts as an adapter. The controller shouldn't care if this is real or mock.
 */

const verifyGST = async (gstNumber) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real implementation, this would call the actual GST API
  // For now, we return dummy data based on the API contract
  
  if (!gstNumber || gstNumber.length < 15) {
      throw new Error('INVALID_GST_NUMBER');
  }

  return {
    gstNumber: gstNumber.toUpperCase(),
    legalName: "Pratham International",
    tradeName: "Pratham International",
    businessType: "Proprietorship",
    address: "Delhi",
    stateCode: gstNumber.substring(0, 2),
    stateName: "Delhi",
    pincode: "110001",
    gstStatus: "ACTIVE"
  };
};

module.exports = {
  verifyGST
};
