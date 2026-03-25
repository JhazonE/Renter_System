class Registration {
  constructor({
    id,
    name,
    firstName,
    lastName,
    email,
    studentPhone,
    parentPhone,
    roomNo,
    floorNo,
    unit,
    imd,
    hasFingerprint = false,
    status = 'Pending',
    initials,
    date,
    canGenerateMealTicket = false,
    mealTicketExpirationDate = null,
    createdAt
  }) {
    this.id = id;
    this.name = name;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.studentPhone = studentPhone;
    this.parentPhone = parentPhone;
    this.roomNo = roomNo;
    this.floorNo = floorNo;
    this.unit = unit;
    this.imd = imd;
    this.hasFingerprint = hasFingerprint;
    this.status = status;
    this.initials = initials;
    this.date = date;
    this.canGenerateMealTicket = canGenerateMealTicket;
    this.mealTicketExpirationDate = mealTicketExpirationDate;
    this.createdAt = createdAt;
  }

  // Business logic could go here
  updateStatus(newStatus) {
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus;
    } else {
      throw new Error(`Invalid status: ${newStatus}`);
    }
  }
}

module.exports = Registration;
