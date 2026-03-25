const User = require('../../domain/entities/User');
const bcrypt = require('bcryptjs');

class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    let hashedPassword = null;
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(userData.password, salt);
    }

    const user = new User({
      ...userData,
      password: hashedPassword,
      status: userData.status || 'Active',
      initials: this._getInitials(userData.name)
    });
    
    return await this.userRepository.save(user);
  }

  _getInitials(name) {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}

module.exports = CreateUser;
