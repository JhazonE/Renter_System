class UserController {
  constructor(getUsers, createUser, updateUser, deleteUser, loginUser) {
    this.getUsers = getUsers;
    this.createUser = createUser;
    this.updateUser = updateUser;
    this.deleteUser = deleteUser;
    this.loginUser = loginUser;
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await this.loginUser.execute({ username, password });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await this.getUsers.execute();
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async create(req, res) {
    try {
      const user = await this.createUser.execute(req.body);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const user = await this.updateUser.execute(id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.deleteUser.execute(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = UserController;
