
module.exports = function withLicenseDetails(user, base) {
  return {
    ...base,
    licenseIssueDate: user.licenseIssueDate || null,
    licenseValidUntil: user.licenseValidUntil || null,
    licenseAddress: user.licenseAddress || '',
  };
};