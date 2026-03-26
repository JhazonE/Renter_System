class MealTicketController {
  constructor(generateMealTicket, getMealTicketsByRegistration) {
    this.generateMealTicket = generateMealTicket;
    this.getMealTicketsByRegistration = getMealTicketsByRegistration;
  }

  async generate(req, res) {
    const { registrationId, mealType, biometricTemplate } = req.body;
    if (!registrationId && !biometricTemplate) {
      return res.status(400).json({ error: 'Either registrationId or biometricTemplate is required' });
    }
    try {
      console.log(`[MealTicketController] Generating ticket. RID: ${registrationId}, Type: ${mealType}`);
      const mealTicket = await this.generateMealTicket.execute(registrationId, mealType, biometricTemplate);
      console.log(`[MealTicketController] Ticket generated: ${mealTicket.ticketNumber}`);
      res.status(201).json(mealTicket);
    } catch (err) {
      console.error(err);
      if (err.message.includes('not authorized') || err.message.includes('not found')) {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Database error' });
    }
  }

  async getByRegistrationId(req, res) {
    const { registrationId } = req.params;
    try {
      const mealTickets = await this.getMealTicketsByRegistration.execute(registrationId);
      res.json(mealTickets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = MealTicketController;
