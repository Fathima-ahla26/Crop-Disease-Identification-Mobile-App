import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT || 4000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`CropCare API http://localhost:${port}`);
  });
}

export { app };
