
function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    location: user.location,
    isGoogleAccount: Boolean(user.googleId),
    hasProfileImage: Boolean(user.profileImage?.data),

    // driving license
    licenseStatus: user.licenseStatus, // not_submitted | pending | verified | rejected
    licenseNumber: user.licenseNumber,
    licenseFullName: user.licenseFullName,
    licenseDob: user.licenseDob,
    licenseMobile: user.licenseMobile,
    licenseClasses: user.licenseClasses || [], // '2w' and / or '4w'
    licenseSubmittedAt: user.licenseSubmittedAt,
    hasLicenseImage: Boolean(user.licenseImage?.data),
    hasLicenseBackImage: Boolean(user.licenseBackImage?.data),
  };
}

module.exports = toPublicUser;