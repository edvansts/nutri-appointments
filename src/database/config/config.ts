module.exports = {
  development: {
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    uri: process.env.DB_URI,
    database: process.env.DB_NAME,
  },
  test: {
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    uri: process.env.DB_URI,
    database: process.env.DB_NAME,
  },
  production: {
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
  },
};
