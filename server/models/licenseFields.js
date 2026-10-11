
module.exports = {
  licenseIssueDate: { type: Date, default: null },
  licenseValidUntil: { type: Date, default: null },
  licenseAddress: { type: String, trim: true, maxlength: 300, default: '' },
};