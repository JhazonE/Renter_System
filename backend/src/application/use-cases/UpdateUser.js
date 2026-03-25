const User = require('../../domain/entities/User');
const bcrypt = require('bcryptjs');

class UpdateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, userData) {
    const updatedData = { ...userData };
    
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(userData.password, salt);
    }

    if (userData.name) {
      updatedData.initials = this._getInitials(userData.name);
    }

    return await this.userRepository.update(id, updatedData);
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

module.exports = UpdateUser;
