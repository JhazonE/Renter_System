class MealTicketController {
  constructor(generateMealTicket, getMealTicketsByRegistration) {
    this.generateMealTicket = generateMealTicket;
    this.getMealTicketsByRegistration = getMealTicketsByRegistration;
  }

  async generate(req, res) {
    const { registrationId } = req.body;
    if (!registrationId) {
      return res.status(400).json({ error: 'registrationId is required' });
    }
    try {
      const mealTicket = await this.generateMealTicket.execute(registrationId);
      res.status(201).json(mealTicket);
    } catch (err) {
      console.error(err);
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
