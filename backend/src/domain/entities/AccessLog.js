class AccessLog {
  constructor(id, name, dept, point, location, type, status, date, time, avatar, createdAt) {
    this.id = id;
    this.name = name;
    this.dept = dept;
    this.point = point;
    this.location = location;
    this.type = type;
    this.status = status;
    this.date = date;
    this.time = time;
    this.avatar = avatar;
    this.createdAt = createdAt;
  }
}

module.exports = AccessLog;
