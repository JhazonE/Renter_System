class MealTicket {
  constructor({
    id,
    registrationId,
    ticketNumber,
    mealType,
    renterName,
    status = 'Active',
    generatedAt,
    expiresAt
  }) {
    this.id = id;
    this.registrationId = registrationId;
    this.ticketNumber = ticketNumber;
    this.mealType = mealType;
    this.renterName = renterName;
    this.status = status;
    this.generatedAt = generatedAt;
    this.expiresAt = expiresAt;
  }

  isExpired() {
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  }

  markAsUsed() {
    this.status = 'Used';
  }
}

module.exports = MealTicket;
