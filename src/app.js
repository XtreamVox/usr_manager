import express from 'express';
import helmet from 'helmet';
import router from './routes/user.routes.js';
import dbConnect from './config/db.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use("/uploads", express.static("uploads"));
app.use('/api/user', router);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dbConnect();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(`📚 API en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
};


export default app;