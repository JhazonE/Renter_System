class RegistrationController {
  constructor(getRegistrations, createRegistration, updateRegistrationStatus, updateRegistration, toggleMealTicketAllowanceUseCase, deleteRegistration, setMealTicketExpirationUseCase, getExpiredMealTickets) {
    this.getRegistrations = getRegistrations;
    this.createRegistration = createRegistration;
    this.updateRegistrationStatus = updateRegistrationStatus;
    this.updateRegistration = updateRegistration;
    this.toggleMealTicketAllowanceUseCase = toggleMealTicketAllowanceUseCase;
    this.deleteRegistration = deleteRegistration;
    this.setMealTicketExpirationUseCase = setMealTicketExpirationUseCase;
    this.getExpiredMealTicketsUseCase = getExpiredMealTickets;
  }

  async getAll(req, res) {
    try {
      const registrations = await this.getRegistrations.execute();
      res.json(registrations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async getExpired(req, res) {
    try {
      const registrations = await this.getExpiredMealTicketsUseCase.execute();
      res.json(registrations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async setMealTicketExpiration(req, res) {
    const { id } = req.params;
    const { expirationDate } = req.body;
    try {
      const registration = await this.setMealTicketExpirationUseCase.execute(id, expirationDate);
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      res.json(registration);
    } catch (err) {
      console.error(`Error safely setting meal ticket expiration for ${id}:`, err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async create(req, res) {
    try {
      const registration = await this.createRegistration.execute(req.body);
      res.status(201).json(registration);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const registration = await this.updateRegistrationStatus.execute(id, status);
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      res.json(registration);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    console.log(`Updating registration ${id} with data:`, req.body);
    try {
      const registration = await this.updateRegistration.execute(id, req.body);
      if (!registration) {
        console.log(`Registration ${id} not found for update`);
        return res.status(404).json({ error: 'Registration not found' });
      }
      console.log(`Registration ${id} updated successfully:`, JSON.stringify(registration, null, 2));
      res.json(registration);
    } catch (err) {
      console.error(`Error updating registration ${id}:`, err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async toggleMealTicketAllowance(req, res) {
    const { id } = req.params;
    const { allowed } = req.body;
    try {
      const registration = await this.toggleMealTicketAllowanceUseCase.execute(id, allowed);
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      res.json(registration);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    try {
      const registration = await this.deleteRegistration.execute(id);
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      res.json({ message: 'Registration deleted successfully', registration });
    } catch (err) {
      console.error(`Error deleting registration ${id}:`, err);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = RegistrationController;
