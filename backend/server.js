const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Infrastructure
const db = require('./src/infrastructure/database/db');
const GetRegistrations = require('./src/application/use-cases/GetRegistrations');
const CreateRegistration = require('./src/application/use-cases/CreateRegistration');
const UpdateRegistrationStatus = require('./src/application/use-cases/UpdateRegistrationStatus');
const UpdateRegistration = require('./src/application/use-cases/UpdateRegistration');
const DeleteRegistration = require('./src/application/use-cases/DeleteRegistration');
const GetUsers = require('./src/application/use-cases/GetUsers');
const CreateUser = require('./src/application/use-cases/CreateUser');
const UpdateUser = require('./src/application/use-cases/UpdateUser');
const DeleteUser = require('./src/application/use-cases/DeleteUser');
const LoginUser = require('./src/application/use-cases/LoginUser');
const GenerateMealTicket = require('./src/application/use-cases/GenerateMealTicket');
const GetMealTicketsByRegistration = require('./src/application/use-cases/GetMealTicketsByRegistration');
const ToggleMealTicketAllowance = require('./src/application/use-cases/ToggleMealTicketAllowance');
const GetAccessLogs = require('./src/application/use-cases/GetAccessLogs');
const CreateAccessLog = require('./src/application/use-cases/CreateAccessLog');
const GetAuditLogs = require('./src/application/use-cases/GetAuditLogs');
const CreateAuditLog = require('./src/application/use-cases/CreateAuditLog');

const SetMealTicketExpiration = require('./src/application/use-cases/SetMealTicketExpiration');
const GetExpiredMealTickets = require('./src/application/use-cases/GetExpiredMealTickets');

// Structure
const PostgresRegistrationRepository = require('./src/infrastructure/repositories/PostgresRegistrationRepository');
const PostgresUserRepository = require('./src/infrastructure/repositories/PostgresUserRepository');
const PostgresMealTicketRepository = require('./src/infrastructure/repositories/PostgresMealTicketRepository');
const PostgresAccessLogRepository = require('./src/infrastructure/repositories/PostgresAccessLogRepository');
const PostgresAuditLogRepository = require('./src/infrastructure/repositories/PostgresAuditLogRepository');
// Interface Controllers & Routes
const RegistrationController = require('./src/interfaces/controllers/RegistrationController');
const UserController = require('./src/interfaces/controllers/UserController');
const MealTicketController = require('./src/interfaces/controllers/MealTicketController');
const AccessLogController = require('./src/interfaces/controllers/AccessLogController');
const AuditLogController = require('./src/interfaces/controllers/AuditLogController');
const createRegistrationRoutes = require('./src/interfaces/routes/registrationRoutes');
const createUserRoutes = require('./src/interfaces/routes/userRoutes');
const createMealTicketRoutes = require('./src/interfaces/routes/mealTicketRoutes');
const createAccessLogRoutes = require('./src/interfaces/routes/accessLogRoutes');
const createAuditLogRoutes = require('./src/interfaces/routes/auditLogRoutes');
const GetReportSummary = require('./src/application/use-cases/GetReportSummary');
const ReportController = require('./src/interfaces/controllers/ReportController');
const createReportRoutes = require('./src/interfaces/routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dependency Injection
const registrationRepository = new PostgresRegistrationRepository(db);
const userRepository = new PostgresUserRepository(db);
const mealTicketRepository = new PostgresMealTicketRepository(db);
const accessLogRepository = new PostgresAccessLogRepository(db);
const auditLogRepository = new PostgresAuditLogRepository(db);

const getRegistrations = new GetRegistrations(registrationRepository);
const createRegistration = new CreateRegistration(registrationRepository);
const updateRegistrationStatus = new UpdateRegistrationStatus(registrationRepository);
const updateRegistration = new UpdateRegistration(registrationRepository);
const deleteRegistration = new DeleteRegistration(registrationRepository);
const setMealTicketExpiration = new SetMealTicketExpiration(registrationRepository);
const getExpiredMealTickets = new GetExpiredMealTickets(registrationRepository);

const getUsers = new GetUsers(userRepository);
const createUser = new CreateUser(userRepository);
const updateUser = new UpdateUser(userRepository);
const deleteUser = new DeleteUser(userRepository);
const loginUser = new LoginUser(userRepository);

const generateMealTicket = new GenerateMealTicket(mealTicketRepository, registrationRepository);
const getMealTicketsByRegistration = new GetMealTicketsByRegistration(mealTicketRepository);
const toggleMealTicketAllowance = new ToggleMealTicketAllowance(registrationRepository);
const getAccessLogs = new GetAccessLogs(accessLogRepository);
const createAccessLog = new CreateAccessLog(accessLogRepository);
const getAuditLogs = new GetAuditLogs(auditLogRepository);
const createAuditLog = new CreateAuditLog(auditLogRepository);
const getReportSummary = new GetReportSummary(registrationRepository, accessLogRepository);

const registrationController = new RegistrationController(
  getRegistrations,
  createRegistration,
  updateRegistrationStatus,
  updateRegistration,
  toggleMealTicketAllowance,
  deleteRegistration,
  setMealTicketExpiration,
  getExpiredMealTickets
);

const userController = new UserController(getUsers, createUser, updateUser, deleteUser, loginUser);
const mealTicketController = new MealTicketController(generateMealTicket, getMealTicketsByRegistration);
const accessLogController = new AccessLogController(getAccessLogs, createAccessLog);
const auditLogController = new AuditLogController(getAuditLogs, createAuditLog);
const reportController = new ReportController(getReportSummary);

// Routes
app.use('/api/registrations', createRegistrationRoutes(registrationController));
app.use('/api/users', createUserRoutes(userController));
app.use('/api/meal-tickets', createMealTicketRoutes(mealTicketController));
app.use('/api/access-logs', createAccessLogRoutes(accessLogController));
app.use('/api/audit-logs', createAuditLogRoutes(auditLogController));
app.use('/api/reports', createReportRoutes(reportController));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Clean Architecture`);
});
