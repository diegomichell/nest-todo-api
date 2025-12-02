import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { Task, TaskStatus } from '../entities/task.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Task],
  synchronize: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = AppDataSource.getRepository(User);
    const taskRepository = AppDataSource.getRepository(Task);

    // Clear existing data
    await taskRepository.delete({});
    await userRepository.delete({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = userRepository.create({
      email: 'john.doe@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
    });

    const user2 = userRepository.create({
      email: 'jane.smith@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
    });

    await userRepository.save([user1, user2]);
    console.log('Users created successfully');

    // Create tasks for user1
    const tasksForUser1 = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the API',
        status: TaskStatus.IN_PROGRESS,
        userId: user1.id,
        dueDate: new Date('2025-12-15'),
      },
      {
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests',
        status: TaskStatus.TODO,
        userId: user1.id,
        dueDate: new Date('2025-12-05'),
      },
      {
        title: 'Update dependencies',
        description: 'Update all npm packages to latest versions',
        status: TaskStatus.DONE,
        userId: user1.id,
        dueDate: new Date('2025-11-30'),
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT authentication to the API',
        status: TaskStatus.DONE,
        userId: user1.id,
        dueDate: new Date('2025-11-28'),
      },
    ];

    // Create tasks for user2
    const tasksForUser2 = [
      {
        title: 'Design database schema',
        description: 'Create database schema for user and task entities',
        status: TaskStatus.DONE,
        userId: user2.id,
        dueDate: new Date('2025-11-25'),
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for continuous integration',
        status: TaskStatus.TODO,
        userId: user2.id,
        dueDate: new Date('2025-12-10'),
      },
      {
        title: 'Write unit tests',
        description: 'Add unit tests for all services and controllers',
        status: TaskStatus.IN_PROGRESS,
        userId: user2.id,
        dueDate: new Date('2025-12-08'),
      },
    ];

    const allTasks = [...tasksForUser1, ...tasksForUser2].map((task) =>
      taskRepository.create(task),
    );

    await taskRepository.save(allTasks);
    console.log('Tasks created successfully');

    console.log('\nSeed data summary:');
    console.log('==================');
    console.log(`Users created: 2`);
    console.log(`  - ${user1.email} (password: password123)`);
    console.log(`  - ${user2.email} (password: password123)`);
    console.log(`Tasks created: ${allTasks.length}`);
    console.log(`  - User 1 tasks: ${tasksForUser1.length}`);
    console.log(`  - User 2 tasks: ${tasksForUser2.length}`);

    await AppDataSource.destroy();
    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

void seed();
